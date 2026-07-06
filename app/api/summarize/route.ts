import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================
//  VALÓDI AI-ELEMZÉS – Claude Opus 4.8
//  POST { postId } -> a poszt + hozzászólásai + szavazatai alapján
//  strukturált JSON elemzést ad (fő álláspontok, vitapontok, hangulat).
//  Az AI "a közösség szerint..." hangnemben fogalmaz, nem saját véleményként.
// ============================================================

const ANALYSIS_SCHEMA = {
  type: 'object' as const,
  properties: {
    osszegzes: {
      type: 'string',
      description: 'Rövid (2-3 mondatos) összefoglaló a közösség álláspontjáról, magyarul.',
    },
    reszletes: {
      type: 'string',
      description: 'Részletesebb (4-6 mondatos) elemzés a vélemények megoszlásáról, magyarul.',
    },
    fo_allaspontok: {
      type: 'array',
      items: { type: 'string' },
      description: 'A közösség fő álláspontjai (3-5 rövid pont, magyarul).',
    },
    vitapontok: {
      type: 'array',
      items: { type: 'string' },
      description: 'A legvitatottabb kérdések (1-4 rövid pont; üres tömb, ha nincs vita).',
    },
    hangulat: {
      type: 'object',
      properties: {
        pozitiv: { type: 'integer', description: 'Pozitív vélemények aránya százalékban (0-100).' },
        semleges: { type: 'integer', description: 'Semleges vélemények aránya százalékban (0-100).' },
        negativ: { type: 'integer', description: 'Negatív vélemények aránya százalékban (0-100).' },
      },
      required: ['pozitiv', 'semleges', 'negativ'],
      additionalProperties: false,
      description: 'A három érték összege 100 legyen.',
    },
    kulcsszavak: {
      type: 'array',
      items: { type: 'string' },
      description: 'A leggyakoribb témák/kulcsszavak (3-6 darab, magyarul).',
    },
    konszenzus: {
      type: 'integer',
      description: 'Mennyire egységes a közösség véleménye, 0-100 (100 = teljes egyetértés).',
    },
  },
  required: ['osszegzes', 'reszletes', 'fo_allaspontok', 'vitapontok', 'hangulat', 'kulcsszavak', 'konszenzus'],
  additionalProperties: false,
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Hiányzó Supabase konfiguráció' }, { status: 500 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Hiányzó ANTHROPIC_API_KEY' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const postId = Number(body?.postId);
  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: 'Érvénytelen postId' }, { status: 400 });
  }

  const sb = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

  // Poszt + hozzászólások + szavazatok betöltése
  // (a szavazatok a votes táblából, mert a posts számlálóit az RLS nem engedi frissíteni)
  const [postRes, commentsRes, votesRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${postId}&select=*`, { headers: sb }),
    fetch(`${supabaseUrl}/rest/v1/comments?post_id=eq.${postId}&select=content&order=created_at.desc&limit=100`, { headers: sb }),
    fetch(`${supabaseUrl}/rest/v1/votes?post_id=eq.${postId}&select=vote`, { headers: sb }),
  ]);
  const posts = await postRes.json();
  const post = Array.isArray(posts) ? posts[0] : null;
  if (!post) {
    return NextResponse.json({ error: 'A poszt nem található' }, { status: 404 });
  }
  const comments: string[] = ((await commentsRes.json()) as any[])
    .map((c) => String(c.content ?? '').slice(0, 500))
    .filter(Boolean);

  const voteRows = ((await votesRes.json().catch(() => [])) as any[]) ?? [];
  const yes = (post.yes_votes ?? 0) + voteRows.filter((v) => v.vote === 'yes').length;
  const no = (post.no_votes ?? 0) + voteRows.filter((v) => v.vote === 'no').length;

  const material = [
    `TÉMA CÍME: ${post.title}`,
    `KATEGÓRIA: ${post.category ?? 'Általános'}`,
    post.description ? `LEÍRÁS: ${String(post.description).slice(0, 2000)}` : null,
    `SZAVAZATOK: ${yes} mellette, ${no} ellene`,
    comments.length > 0
      ? `HOZZÁSZÓLÁSOK (${comments.length} db):\n${comments.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
      : 'HOZZÁSZÓLÁSOK: még nincs hozzászólás.',
  ].filter(Boolean).join('\n\n');

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: ANALYSIS_SCHEMA },
      },
      system:
        'A CrowdMind közösségi véleményplatform AI-elemzője vagy. A feladatod egy téma közösségi ' +
        'fogadtatásának tárgyilagos összefoglalása MAGYARUL. Soha ne fogalmazz úgy, mintha saját ' +
        'véleményed lenne: mindig "A közösség szerint...", "A legtöbb hozzászóló azt említi...", ' +
        '"A pozitív vélemények fő oka..." stílusban írj. Ha kevés az adat (kevés hozzászólás/szavazat), ' +
        'ezt jelezd őszintén az összegzésben, és óvatosan következtess. A hangulat-százalékokat a ' +
        'szavazatokból ÉS a hozzászólások hangvételéből együtt becsüld; a három érték összege 100 legyen.',
      messages: [{ role: 'user', content: `Elemezd a következő témát és közösségi visszajelzéseit:\n\n${material}` }],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'Az AI nem tudta elemezni ezt a tartalmat.' }, { status: 422 });
    }

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const analysis = JSON.parse(text);
    return NextResponse.json({ analysis, commentsCount: comments.length, votes: { yes, no } });
  } catch (e) {
    console.error('AI elemzés hiba:', e);
    const msg = e instanceof Anthropic.APIError ? `AI hiba (${e.status})` : 'AI elemzés sikertelen';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
