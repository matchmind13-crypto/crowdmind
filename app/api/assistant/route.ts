import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserIdFromRequest } from '@/lib/serverAuth';
import { checkRateLimit } from '@/lib/rateLimit';

// ============================================================
//  AI ASSZISZTENS – Claude Opus 4.8
//  POST { messages: [{role: "user"|"assistant", content: string}, ...] }
//  A CrowdMind asszisztense: a platform friss témáit kontextusként kapja,
//  és magyarul válaszol a felhasználó kérdéseire.
// ============================================================

const MAX_TURNS = 12;          // ennyi korábbi üzenetet veszünk figyelembe
const MAX_MESSAGE_CHARS = 4000;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Hiányzó ANTHROPIC_API_KEY' }, { status: 500 });
  }

  // Védelem: csak bejelentkezve + felhasználónként max 15 üzenet / 5 perc.
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Az asszisztens használatához jelentkezz be.' }, { status: 401 });
  }
  if (!checkRateLimit(`assistant:${userId}`, 15, 5 * 60 * 1000)) {
    return NextResponse.json({ error: 'Túl sok üzenetet küldtél. Várj pár percet, és próbáld újra.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const raw = Array.isArray(body?.messages) ? body.messages : null;
  if (!raw || raw.length === 0) {
    return NextResponse.json({ error: 'Hiányzó üzenetek' }, { status: 400 });
  }

  // Bemenet szigorú tisztítása: csak user/assistant szerepek, szöveges tartalom.
  const messages = raw
    .slice(-MAX_TURNS)
    .map((m: any) => ({
      role: m?.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: String(m?.content ?? '').slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter((m: { content: string }) => m.content.trim().length > 0);
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Az utolsó üzenetnek felhasználói kérdésnek kell lennie' }, { status: 400 });
  }

  // Friss témák kontextusnak (best-effort – ha nem sikerül, enélkül megy tovább)
  let topicsContext = '';
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=title,category,yes_votes,no_votes&order=created_at.desc&limit=10`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
    );
    const posts = (await res.json()) as any[];
    if (Array.isArray(posts) && posts.length > 0) {
      topicsContext =
        '\n\nAKTUÁLIS TÉMÁK A PLATFORMON:\n' +
        posts
          .map((p) => `- ${p.title} (${p.category ?? 'Általános'}; ${p.yes_votes ?? 0} mellette / ${p.no_votes ?? 0} ellene)`)
          .join('\n');
    }
  } catch {
    // kontextus nélkül is működik
  }

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      system:
        'A CrowdMind AI asszisztense vagy. A CrowdMind egy magyar nyelvű, AI-alapú közösségi ' +
        'véleményplatform: a felhasználók témákat indítanak, szavaznak (mellette/ellene) és hozzászólnak, ' +
        'az AI pedig összegzi a közösség véleményét. MAGYARUL válaszolj, tömören és barátságosan ' +
        '(legfeljebb néhány bekezdés). Ha a platform témáiról kérdeznek, használd az alábbi listát. ' +
        'Ha véleményt kérnek egy témáról, a közösségi nézőpontot hangsúlyozd ("a közösség szerint..."), ' +
        'ne a sajátodat. Ha valamit nem tudsz, mondd ki őszintén.' +
        topicsContext,
      messages,
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ reply: 'Erre a kérdésre nem tudok válaszolni. Kérdezz valami mást! 🙂' });
    }

    const reply = response.content.find((b) => b.type === 'text')?.text ?? '';
    return NextResponse.json({ reply });
  } catch (e) {
    console.error('Asszisztens hiba:', e);
    const msg = e instanceof Anthropic.APIError ? `AI hiba (${e.status})` : 'Az asszisztens nem elérhető';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
