import { supabase } from './supabase';

/**
 * Komment-lájkok (comment_likes tábla).
 * A számlálók mindenkinek látszanak; lájkolni bejelentkezve lehet.
 * A tábla létrejöttéig a függvények kegyesen üres/„nem elérhető" választ adnak.
 */

function tableMissing(message?: string | null) {
  return !!message && /relation|does not exist|schema cache/i.test(message);
}

/** Lájk-számok + saját lájkok egy komment-listához (egyetlen lekérdezéssel). */
export async function fetchCommentLikes(
  commentIds: number[],
): Promise<Map<number, { count: number; likedByMe: boolean }>> {
  const result = new Map<number, { count: number; likedByMe: boolean }>();
  if (commentIds.length === 0) return result;
  const { data: { session } } = await supabase.auth.getSession();
  const myId = session?.user?.id ?? null;
  const { data, error } = await supabase
    .from('comment_likes')
    .select('comment_id,user_id')
    .in('comment_id', commentIds);
  if (error) return result; // tábla még nincs → minden 0
  ((data ?? []) as { comment_id: number; user_id: string }[]).forEach((r) => {
    const cur = result.get(r.comment_id) ?? { count: 0, likedByMe: false };
    cur.count += 1;
    if (myId && r.user_id === myId) cur.likedByMe = true;
    result.set(r.comment_id, cur);
  });
  return result;
}

export async function toggleCommentLike(
  commentId: number,
  currentlyLiked: boolean,
): Promise<{ liked: boolean; needsLogin?: boolean; unavailable?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { liked: currentlyLiked, needsLogin: true };

  if (currentlyLiked) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', session.user.id);
    if (error) return { liked: true, unavailable: tableMissing(error.message) };
    return { liked: false };
  }

  const { error } = await (supabase.from('comment_likes') as any).insert({
    comment_id: commentId,
    user_id: session.user.id,
  });
  if (error) {
    // 23505 = már lájkoltad (pl. két fülön) — sikeresnek vesszük.
    if (error.code === '23505') return { liked: true };
    return { liked: false, unavailable: tableMissing(error.message) };
  }
  return { liked: true };
}
