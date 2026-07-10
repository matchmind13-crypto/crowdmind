import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { getUserIdFromRequest } from '@/lib/serverAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { SUPABASE_URL } from '@/lib/publicConfig';

// ============================================================
//  AI-MODERÁCIÓ – Claude Haiku 4.5
//  POST { kind: 'post' | 'comment', id: number }
//  Új tartalom létrehozása után hívja a kliens (best-effort).
//  A házirend szerint előszűri a szöveget; a gyanúsat automatikus
//  jelentésként az admin pultba teszi (reports tábla, source='ai').
//  Embert nem helyettesít: tartalmat SOSEM töröl, csak jelez.
// ============================================================

const FRESH_WINDOW_MS = 15 * 60 * 1000; // csak friss (15 percen belüli) tartalomra fut
const MAX_CHARS = 4000;

const SYSTEM_PROMPT =
  'Tartalom-moderátor előszűrő vagy a CrowdMind magyar véleményplatformon. ' +
  'A házirend szerint TILOS: (1) gyűlöletkeltés, zaklatás, fenyegetés — emberek lealacsonyítása ' +
  'származás, vallás, nem, irányultság vagy más tulajdonság alapján; (2) spam és kéretlen reklám; ' +
  '(3) jogsértő tartalom vagy arra buzdítás; (4) mások személyes adatainak (cím, telefonszám, ' +
  'azonosítók) engedély nélküli közzététele; (5) szándékos megtévesztés, álhírterjesztés; ' +
  '(6) a rendszer manipulálása. ' +
  'NAGYON FONTOS: a kemény, de tisztességes vélemény NEM szabálysértés. Népszerűtlen álláspont, ' +
  'éles kritika, irónia vagy egy-egy csúnya szó önmagában RENDBEN van — a platform lényege a vita. ' +
  'Csak akkor jelezz, ha a tartalom ténylegesen a fenti kategóriák valamelyikébe esik. ' +
  '"sulyos" csak egyértelmű, komoly esetben (pl. konkrét fenyegetés, doxxing, nyílt gyűlöletbeszéd). ' +
  'KIZÁRÓLAG ezzel a JSON-nal válaszolj, más szöveg nélkül: ' +
  '{"dontes":"rendben"|"gyanus"|"sulyos","kategoria":"rövid kategórianév","indoklas":"legfeljebb egy mondat magyarul"}';

export async function POST(request: Request) {
  // Ha a kulcsok hiányoznak, a moderáció csendben kimarad — a tartalom él.
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ok: true, skipped: true });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ ok: true, skipped: true });

  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Bejelentkezés szükséges.' }, { status: 401 });
  if (!checkRateLimit(`moderate:${userId}`, 20, 5 * 60 * 1000)) {
    return NextResponse.json({ error: 'Túl sok kérés. Próbáld később.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const kind = body?.kind === 'comment' ? 'comment' : body?.kind === 'post' ? 'post' : null;
  const id = Number(body?.id);
  if (!kind || !Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Hibás kérés.' }, { status: 400 });
  }

  const service = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // A tartalom betöltése — csak a szerző kérhet ellenőrzést, a saját friss tartalmára.
  let text = '';
  let authorId = '';
  let createdAt = '';
  if (kind === 'post') {
    const { data } = await service
      .from('posts')
      .select('id,title,description,user_id,created_at')
      .eq('id', id)
      .maybeSingle();
    const row = data as { title?: string; description?: string; user_id: string; created_at: string } | null;
    if (!row) return NextResponse.json({ error: 'Nem található.' }, { status: 404 });
    text = `CÍM: ${row.title ?? ''}\nSZÖVEG: ${row.description ?? ''}`;
    authorId = row.user_id;
    createdAt = row.created_at;
  } else {
    const { data } = await service
      .from('comments')
      .select('id,content,user_id,created_at')
      .eq('id', id)
      .maybeSingle();
    const row = data as { content?: string; user_id: string; created_at: string } | null;
    if (!row) return NextResponse.json({ error: 'Nem található.' }, { status: 404 });
    text = `HOZZÁSZÓLÁS: ${row.content ?? ''}`;
    authorId = row.user_id;
    createdAt = row.created_at;
  }
  if (authorId !== userId) return NextResponse.json({ error: 'Nem található.' }, { status: 404 });
  if (createdAt && Date.now() - new Date(createdAt).getTime() > FRESH_WINDOW_MS) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // AI-döntés. Fail-open: ha az AI hibázik, a tartalom jelzés nélkül marad —
  // a felhasználói Jelentés gomb és az admin szeme a biztonsági háló.
  let verdict: 'rendben' | 'gyanus' | 'sulyos' = 'rendben';
  let category = '';
  let reasonText = '';
  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: (kind === 'post' ? 'ÚJ TÉMA\n' : 'ÚJ HOZZÁSZÓLÁS\n') + text.slice(0, MAX_CHARS),
        },
      ],
    });
    if (response.stop_reason === 'refusal') {
      verdict = 'gyanus';
      category = 'feldolgozás megtagadva';
      reasonText = 'Az AI elutasította a tartalom feldolgozását — kézi ellenőrzés javasolt.';
    } else {
      const raw = response.content.find((b) => b.type === 'text')?.text ?? '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (parsed?.dontes === 'gyanus' || parsed?.dontes === 'sulyos') {
        verdict = parsed.dontes;
        category = String(parsed.kategoria ?? '').slice(0, 80);
        reasonText = String(parsed.indoklas ?? '').slice(0, 240);
      }
    }
  } catch (e) {
    console.error('Moderációs AI hiba:', e);
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (verdict === 'rendben') return NextResponse.json({ ok: true, flagged: false });

  // Automatikus jelentés az admin pultba (source='ai', emberi bejelentő nélkül).
  const reason = `${verdict === 'sulyos' ? 'SÚLYOS' : 'Gyanús'} – ${category || 'házirend-sértés'}: ${reasonText}`.slice(0, 300);
  const { error: insertError } = await (service.from('reports') as any).insert({
    reporter_id: null,
    source: 'ai',
    target_type: kind,
    target_id: id,
    reason,
  });
  if (insertError) {
    // Duplikátum vagy hiányzó oszlop (a SQL még nem futott le) — nem baj, a végpont nem törik.
    console.error('AI-jelentés mentési hiba:', insertError.message);
  }

  return NextResponse.json({ ok: true, flagged: true, stored: !insertError });
}
