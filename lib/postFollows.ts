import { supabase } from './supabase';

/**
 * Téma-szintű követés (post_follows tábla).
 * Aki követ egy témát, értesítést kap minden új hozzászólásról.
 * A tábla létrejöttéig a függvények csendben "nem elérhető"-t adnak vissza.
 */

function tableMissing(message?: string | null) {
  return !!message && /relation|does not exist|schema cache/i.test(message);
}

export async function isFollowingPost(postId: number): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data, error } = await supabase
    .from('post_follows')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function toggleFollowPost(
  postId: number,
): Promise<{ following: boolean; needsLogin?: boolean; unavailable?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { following: false, needsLogin: true };

  const following = await isFollowingPost(postId);
  if (following) {
    const { error } = await supabase
      .from('post_follows')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', session.user.id);
    if (error) return { following: true, unavailable: tableMissing(error.message) };
    return { following: false };
  }

  const { error } = await (supabase.from('post_follows') as any).insert({
    post_id: postId,
    user_id: session.user.id,
  });
  if (error) {
    // 23505 = már követed (pl. két fülön) — azt sikeresnek vesszük.
    if (error.code === '23505') return { following: true };
    return { following: false, unavailable: tableMissing(error.message) };
  }
  return { following: true };
}

/** A bejelentkezett felhasználó által követett témák azonosítói. */
export async function fetchFollowedPostIds(): Promise<number[] | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from('post_follows')
    .select('post_id')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  if (error) return null;
  return ((data ?? []) as { post_id: number }[]).map((r) => r.post_id);
}
