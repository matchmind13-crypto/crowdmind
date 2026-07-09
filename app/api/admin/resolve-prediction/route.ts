import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminServer';

/**
 * Admin: jóslat eredményének rögzítése ('yes' = bejött, 'no' = nem jött be).
 * A rögzítés után minden szavazó értesítést kap a saját eredményéről —
 * aki eltalálta, annak a találata a profilján is megjelenik.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { admin } = guard;

  const body = await request.json().catch(() => null);
  const postId = Number(body?.postId);
  const outcome = body?.outcome as 'yes' | 'no';
  if (!Number.isInteger(postId) || !['yes', 'no'].includes(outcome)) {
    return NextResponse.json({ error: 'Érvénytelen kérés.' }, { status: 400 });
  }

  try {
    const { data: post } = await admin
      .from('posts')
      .select('id,title,resolve_at,outcome')
      .eq('id', postId)
      .maybeSingle();
    if (!post || !(post as any).resolve_at) {
      return NextResponse.json({ error: 'Ez a téma nem jóslat.' }, { status: 404 });
    }
    if ((post as any).outcome) {
      return NextResponse.json({ error: 'Ez a jóslat már el van döntve.' }, { status: 409 });
    }

    const { error } = await admin.from('posts').update({ outcome }).eq('id', postId);
    if (error) {
      return NextResponse.json({ error: 'A rögzítés nem sikerült.' }, { status: 500 });
    }

    // Értesítés minden szavazónak a saját eredményéről (best-effort, max 100).
    try {
      const title = String((post as any).title ?? '');
      const { data: voteRows } = await admin
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
        await admin.from('notifications').insert(rows);
      }
    } catch {
      // az értesítés nem kritikus
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Váratlan hiba.' }, { status: 500 });
  }
}
