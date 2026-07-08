import { supabase } from './supabase';

/**
 * Komment-szavazatok (comment_likes tábla, vote oszlop: 1 = lájk, -1 = dislike).
 * A számlálók mindenkinek látszanak; szavazni bejelentkezve lehet.
 * Amíg a vote oszlop nem létezik: a lájk a régi úton működik tovább,
 * a dislike pedig udvarias "hamarosan" választ ad.
 */

function columnMissing(message?: string | null) {
  return !!message && /vote|column|schema cache/i.test(message);
}

export interface CommentVoteInfo {
  likes: number;
  dislikes: number;
  myVote: 1 | -1 | 0;
}

/** Szavazat-számok + saját szavazat egy komment-listához (egy lekérdezéssel). */
export async function fetchCommentLikes(
  commentIds: number[],
): Promise<Map<number, CommentVoteInfo>> {
  const result = new Map<number, CommentVoteInfo>();
  if (commentIds.length === 0) return result;
  const { data: { session } } = await supabase.auth.getSession();
  const myId = session?.user?.id ?? null;

  let rows: { comment_id: number; user_id: string; vote: number }[] | null = null;
  const withVote = await supabase
    .from('comment_likes')
    .select('comment_id,user_id,vote')
    .in('comment_id', commentIds);
  if (!withVote.error) {
    rows = (withVote.data ?? []) as any[];
  } else if (columnMissing(withVote.error.message)) {
    // Régi séma: még nincs vote oszlop — minden sor lájknak számít.
    const legacy = await supabase
      .from('comment_likes')
      .select('comment_id,user_id')
      .in('comment_id', commentIds);
    if (legacy.error) return result;
    rows = ((legacy.data ?? []) as any[]).map((r) => ({ ...r, vote: 1 }));
  } else {
    return result; // tábla sincs még
  }

  rows.forEach((r) => {
    const cur = result.get(r.comment_id) ?? { likes: 0, dislikes: 0, myVote: 0 as const };
    const entry: CommentVoteInfo = { ...cur };
    if (r.vote === -1) entry.dislikes += 1;
    else entry.likes += 1;
    if (myId && r.user_id === myId) entry.myVote = r.vote === -1 ? -1 : 1;
    result.set(r.comment_id, entry);
  });
  return result;
}

/** Szavazat beállítása: 1 = lájk, -1 = dislike, 0 = visszavonás. */
export async function setCommentVote(
  commentId: number,
  vote: 1 | -1 | 0,
): Promise<{ ok: boolean; needsLogin?: boolean; unavailable?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true };

  if (vote === 0) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', session.user.id);
    return error ? { ok: false, unavailable: columnMissing(error.message) } : { ok: true };
  }

  const { error } = await (supabase.from('comment_likes') as any).upsert(
    { comment_id: commentId, user_id: session.user.id, vote },
    { onConflict: 'comment_id,user_id' },
  );
  if (error) {
    if (columnMissing(error.message)) {
      // Régi séma: a lájk a régi (insert-alapú) úton még működik, a dislike nem.
      if (vote === 1) {
        const legacy = await (supabase.from('comment_likes') as any).insert({
          comment_id: commentId,
          user_id: session.user.id,
        });
        if (!legacy.error || legacy.error.code === '23505') return { ok: true };
      }
      return { ok: false, unavailable: true };
    }
    return { ok: false };
  }
  return { ok: true };
}
