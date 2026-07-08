import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserIdFromRequest } from '@/lib/serverAuth';
import { SUPABASE_URL } from '@/lib/publicConfig';

/**
 * GDPR fióktörlés: a hívó SAJÁT fiókját és MINDEN adatát véglegesen törli.
 * A service role kulcs csak itt, a szerveren él (env: SUPABASE_SERVICE_ROLE_KEY)
 * — a kliens soha nem látja. A hívó személyazonosságát a Bearer token igazolja,
 * így kizárt, hogy bárki más fiókját törölje.
 */
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Bejelentkezés szükséges.' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: 'A fióktörlés még beállítás alatt áll — kérjük, próbáld később.' },
      { status: 503 },
    );
  }

  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // 1) A saját posztok és az azokhoz tartozó hozzászólások azonosítói
    const { data: myPosts } = await admin.from('posts').select('id').eq('user_id', userId);
    const postIds = ((myPosts ?? []) as { id: number }[]).map((p) => p.id);

    let commentIds: number[] = [];
    if (postIds.length > 0) {
      const { data: postComments } = await admin.from('comments').select('id').in('post_id', postIds);
      commentIds = ((postComments ?? []) as { id: number }[]).map((c) => c.id);
    }
    const { data: myComments } = await admin.from('comments').select('id').eq('user_id', userId);
    commentIds = [...new Set([...commentIds, ...((myComments ?? []) as { id: number }[]).map((c) => c.id)])];

    // 2) Függő adatok törlése (sorrend számít). A hiányzó táblák hibáit lenyeljük.
    const tryDelete = async (fn: () => PromiseLike<unknown>) => { try { await fn(); } catch { /* opcionális tábla */ } };

    if (commentIds.length > 0) {
      await tryDelete(() => admin.from('comment_likes').delete().in('comment_id', commentIds));
    }
    await tryDelete(() => admin.from('comment_likes').delete().eq('user_id', userId));
    await tryDelete(() => admin.from('post_follows').delete().eq('user_id', userId));
    await tryDelete(() => admin.from('saved_posts').delete().eq('user_id', userId));
    await tryDelete(() => admin.from('reports').delete().eq('reporter_id', userId));
    await tryDelete(() => admin.from('notifications').delete().eq('user_id', userId));
    await tryDelete(() => admin.from('votes').delete().eq('user_id', userId));

    if (postIds.length > 0) {
      await tryDelete(() => admin.from('post_follows').delete().in('post_id', postIds));
      await tryDelete(() => admin.from('saved_posts').delete().in('post_id', postIds));
      await tryDelete(() => admin.from('notifications').delete().in('post_id', postIds));
      await tryDelete(() => admin.from('votes').delete().in('post_id', postIds));
      await tryDelete(() => admin.from('ai_analyses').delete().in('post_id', postIds));
    }
    if (commentIds.length > 0) {
      await tryDelete(() => admin.from('comments').delete().in('id', commentIds));
    }
    if (postIds.length > 0) {
      await tryDelete(() => admin.from('posts').delete().in('id', postIds));
    }
    await tryDelete(() => admin.from('profiles').delete().eq('user_id', userId));

    // 3) Végül maga a fiók
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      return NextResponse.json({ error: 'A fiók törlése nem sikerült — próbáld újra.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Váratlan hiba a törlés közben.' }, { status: 500 });
  }
}
