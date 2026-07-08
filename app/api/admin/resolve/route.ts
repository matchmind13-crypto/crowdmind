import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminServer';

/**
 * Admin-döntés egy jelentésről:
 * - action=delete: a kifogásolt tartalom törlése MINDEN függőségével együtt,
 *   plusz a rá vonatkozó összes jelentés lezárása
 * - action=dismiss: a jelentés elutasítása (a tartalom marad)
 */
export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { admin } = guard;

  const body = await request.json().catch(() => null);
  const reportId = Number(body?.reportId);
  const action = body?.action as 'delete' | 'dismiss';
  if (!Number.isInteger(reportId) || !['delete', 'dismiss'].includes(action)) {
    return NextResponse.json({ error: 'Érvénytelen kérés.' }, { status: 400 });
  }

  try {
    const { data: report } = await admin
      .from('reports')
      .select('id,target_type,target_id')
      .eq('id', reportId)
      .maybeSingle();
    if (!report) {
      return NextResponse.json({ error: 'Ez a jelentés már nem létezik.' }, { status: 404 });
    }
    const { target_type: type, target_id: targetId } = report as any;

    if (action === 'dismiss') {
      await admin.from('reports').delete().eq('id', reportId);
      return NextResponse.json({ ok: true, action: 'dismiss' });
    }

    // Törlés a függőségekkel (a hiányzó táblák hibáit lenyeljük)
    const tryDelete = async (fn: () => PromiseLike<unknown>) => { try { await fn(); } catch { /* opcionális tábla */ } };

    if (type === 'post') {
      const { data: postComments } = await admin.from('comments').select('id').eq('post_id', targetId);
      const commentIds = ((postComments ?? []) as { id: number }[]).map((c) => c.id);
      if (commentIds.length > 0) {
        await tryDelete(() => admin.from('comment_likes').delete().in('comment_id', commentIds));
        await tryDelete(() => admin.from('reports').delete().eq('target_type', 'comment').in('target_id', commentIds));
      }
      await tryDelete(() => admin.from('comments').delete().eq('post_id', targetId));
      await tryDelete(() => admin.from('votes').delete().eq('post_id', targetId));
      await tryDelete(() => admin.from('post_follows').delete().eq('post_id', targetId));
      await tryDelete(() => admin.from('saved_posts').delete().eq('post_id', targetId));
      await tryDelete(() => admin.from('ai_analyses').delete().eq('post_id', targetId));
      await tryDelete(() => admin.from('notifications').delete().eq('post_id', targetId));
      await tryDelete(() => admin.from('reports').delete().eq('target_type', 'post').eq('target_id', targetId));
      await admin.from('posts').delete().eq('id', targetId);
    } else {
      // Komment: a válaszai a parent_id cascade miatt mennek; a lájkjaikat előtte szedjük le.
      const { data: replyRows } = await admin.from('comments').select('id').eq('parent_id', targetId);
      const replyIds = ((replyRows ?? []) as { id: number }[]).map((c) => c.id);
      const allIds = [targetId, ...replyIds];
      await tryDelete(() => admin.from('comment_likes').delete().in('comment_id', allIds));
      await tryDelete(() => admin.from('reports').delete().eq('target_type', 'comment').in('target_id', allIds));
      await admin.from('comments').delete().eq('id', targetId);
    }

    return NextResponse.json({ ok: true, action: 'delete' });
  } catch {
    return NextResponse.json({ error: 'A művelet nem sikerült.' }, { status: 500 });
  }
}
