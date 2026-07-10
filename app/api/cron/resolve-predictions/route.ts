import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '@/lib/publicConfig';

// ============================================================
//  AUTOMATA JÓSLAT-DÖNTNÖK – napi cron (vercel.json)
//  Claude Opus 4.8 + internetes keresés: ellenőrzi a nyitott
//  jóslatokat, és amelyik tényekkel egyértelműen eldönthető,
//  azt lezárja + értesíti a szavazókat (mint az admin gomb).
//  A bizonytalan esetek az admin pult "Jóslatok lezárása"
//  szekciójában várnak kézi döntésre.
// ============================================================

export const maxDuration = 300; // webes keresés + elemzés: bőven időt hagyunk neki

const MAX_CHECKS_PER_RUN = 3;  // költség-plafon: futásonként legfeljebb ennyi jóslat
const MAX_CONTINUATIONS = 3;   // pause_turn folytatások plafonja

const SYSTEM_PROMPT =
  'Te a CrowdMind magyar véleményplatform jóslat-döntnöke vagy. Feladatod internetes kereséssel ' +
  'ellenőrizni, hogy egy közösségi jóslat bejött-e. Keress megbízható, friss forrásokat (hírek, ' +
  'hivatalos adatok, árfolyamok), és kizárólag tények alapján dönts. ' +
  'SZABÁLYOK: (1) Csak akkor dönts ("bejott" vagy "nem_jott_be"), ha a tények egyértelműek és ' +
  'forrással alátámasztottak. (2) Ha az információ hiányos, ellentmondásos, vagy nincs megbízható ' +
  'forrás: "bizonytalan" — ilyenkor ember dönt majd. (3) Ha a jóslat határideje MÉG NEM járt le, ' +
  'a döntésed KIZÁRÓLAG "bejott" (ha az esemény már visszafordíthatatlanul megtörtént) vagy ' +
  '"bizonytalan" lehet — "nem_jott_be" ilyenkor tilos, mert a határidőig még bekövetkezhet. ' +
  'A válaszod LEGVÉGÉN kizárólag ez a JSON álljon, más szöveg nélkül utána: ' +
  '{"eredmeny":"bejott"|"nem_jott_be"|"bizonytalan","indoklas":"1-2 mondat magyarul, a forrás megnevezésével"}';

interface OpenPrediction {
  id: number;
  title: string;
  description: string | null;
  resolve_at: string;
}

export async function GET(request: Request) {
  // A Vercel Cron a CRON_SECRET-tel hitelesít (Authorization: Bearer <secret>).
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'A CRON_SECRET környezeti változó nincs beállítva.' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Hiányzó ANTHROPIC_API_KEY.' }, { status: 503 });
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'Hiányzó SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
  }

  const service = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Nyitott jóslatok: a lejártak elöl (őket kötelező eldönteni), utána a
  // legközelebbi határidejűek (korai lezárás, ha az esemény már megtörtént).
  const { data } = await service
    .from('posts')
    .select('id,title,description,resolve_at')
    .not('resolve_at', 'is', null)
    .is('outcome', null)
    .order('resolve_at', { ascending: true })
    .limit(10);
  const all = (data ?? []) as OpenPrediction[];
  const now = Date.now();
  const overdue = all.filter((p) => new Date(p.resolve_at).getTime() <= now);
  const upcoming = all.filter((p) => new Date(p.resolve_at).getTime() > now);
  const candidates = [...overdue, ...upcoming].slice(0, MAX_CHECKS_PER_RUN);

  const anthropic = new Anthropic();

  // A jelölteket PÁRHUZAMOSAN vizsgáljuk, hogy beférjünk az időkeretbe.
  const results = await Promise.all(
    candidates.map(async (p) => {
      const isOverdue = new Date(p.resolve_at).getTime() <= now;
      try {
        const verdict = await judgePrediction(anthropic, p, isOverdue);
        if (verdict.eredmeny === 'bejott' || verdict.eredmeny === 'nem_jott_be') {
          const outcome = verdict.eredmeny === 'bejott' ? 'yes' : 'no';
          const { error } = await service.from('posts').update({ outcome }).eq('id', p.id);
          if (!error) {
            await notifyVoters(service, p.id, p.title, outcome);
            return { id: p.id, title: p.title, dontes: outcome, indoklas: verdict.indoklas };
          }
        }
        return { id: p.id, title: p.title, dontes: 'bizonytalan', indoklas: verdict.indoklas };
      } catch (e) {
        console.error('Jóslat-ellenőrzési hiba:', p.id, e);
        return { id: p.id, title: p.title, dontes: 'hiba' };
      }
    }),
  );

  return NextResponse.json({ ok: true, checked: candidates.length, results });
}

/** Egy jóslat kivizsgálása webes kereséssel; fail-safe: kétes esetben "bizonytalan". */
async function judgePrediction(
  anthropic: Anthropic,
  p: OpenPrediction,
  isOverdue: boolean,
): Promise<{ eredmeny: 'bejott' | 'nem_jott_be' | 'bizonytalan'; indoklas: string }> {
  const userContent =
    `MAI DÁTUM: ${new Date().toISOString().slice(0, 10)}\n` +
    `JÓSLAT: „${p.title}”\n` +
    `LEÍRÁS: ${p.description ?? '—'}\n` +
    `HATÁRIDŐ: ${p.resolve_at}\n` +
    `ÁLLAPOT: ${
      isOverdue
        ? 'A határidő LEJÁRT — a tények alapján döntést kell hozni.'
        : 'A határidő MÉG NEM járt le — csak akkor zárd le ("bejott"), ha az esemény már visszafordíthatatlanul bekövetkezett; különben "bizonytalan".'
    }`;

  let messages: Anthropic.MessageParam[] = [{ role: 'user', content: userContent }];
  const params = {
    model: 'claude-opus-4-8',
    max_tokens: 16000,
    thinking: { type: 'adaptive' as const },
    system: SYSTEM_PROMPT,
    tools: [{ type: 'web_search_20260209' as const, name: 'web_search' as const, max_uses: 4 }],
  };

  let response = await anthropic.messages.create({ ...params, messages });
  // A szerveroldali kereső-kör limitje esetén (pause_turn) folytatjuk ugyanott.
  let continuations = 0;
  while (response.stop_reason === 'pause_turn' && continuations < MAX_CONTINUATIONS) {
    messages = [...messages, { role: 'assistant', content: response.content }];
    response = await anthropic.messages.create({ ...params, messages });
    continuations++;
  }

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('\n');
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let parsed: { eredmeny?: string; indoklas?: string } | null = null;
  try {
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    parsed = null;
  }
  if (!parsed || !['bejott', 'nem_jott_be', 'bizonytalan'].includes(parsed.eredmeny ?? '')) {
    return { eredmeny: 'bizonytalan', indoklas: 'Az AI válasza nem volt értelmezhető — kézi döntés szükséges.' };
  }
  return {
    eredmeny: parsed.eredmeny as 'bejott' | 'nem_jott_be' | 'bizonytalan',
    indoklas: String(parsed.indoklas ?? '').slice(0, 400),
  };
}

/** Értesítés minden szavazónak a saját eredményéről (ugyanaz, mint az admin-gombnál). */
async function notifyVoters(
  service: SupabaseClient,
  postId: number,
  title: string,
  outcome: 'yes' | 'no',
) {
  try {
    const { data: voteRows } = await service
      .from('votes')
      .select('user_id,vote')
      .eq('post_id', postId)
      .limit(100);
    const rows = ((voteRows ?? []) as { user_id: string; vote: string }[])
      .filter((v) => v.user_id && (v.vote === 'yes' || v.vote === 'no'))
      .map((v) => ({
        user_id: v.user_id,
        post_id: postId,
        message:
          v.vote === outcome
            ? `🎯 Igazad lett! Bejött a tipped itt: „${title}” — a találat a profilodon is megjelenik.`
            : `A jóslat eldőlt: „${title}” — ezúttal nem jött össze, a következőnél tiéd a pálya!`,
        read: false,
      }));
    if (rows.length > 0) {
      await service.from('notifications').insert(rows);
    }
  } catch {
    // az értesítés nem kritikus
  }
}
