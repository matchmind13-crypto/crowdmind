import { supabase } from './supabase';
import { timeAgo } from './timeAgo';
import type { FeedPost, FeedComment, PostType } from '@/data/types';

const POST_TYPES: PostType[] = [
  'question', 'debate', 'opinion', 'experience', 'comparison', 'poll', 'media', 'appreciation',
];

const FALLBACK_AUTHOR = 'CrowdMind tag';

/** user_id -> username tömeges feloldása a profiles táblából. */
async function resolveUsernames(userIds: string[]): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return names;
  const { data } = await supabase
    .from('profiles')
    .select('user_id,username')
    .in('user_id', unique);
  (data ?? []).forEach((p) => {
    const row = p as { user_id: string; username: string };
    names.set(row.user_id, row.username);
  });
  return names;
}

/** Az összes poszt betöltése (legfrissebb elöl), szerzőnevekkel és kommentszámmal. */
export async function fetchFeedPosts(): Promise<FeedPost[]> {
  const { data: rows, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const posts = (rows ?? []) as any[];

  // Kommentszámok egyetlen lekérdezésből.
  const { data: commentRows } = await supabase.from('comments').select('post_id');
  const counts = new Map<number, number>();
  ((commentRows ?? []) as any[]).forEach((c) => {
    counts.set(c.post_id, (counts.get(c.post_id) ?? 0) + 1);
  });

  const names = await resolveUsernames(posts.map((p) => p.user_id));

  return posts.map((p) => ({
    id: p.id,
    category: [p.category || 'Általános', ...(p.subcategory ? [p.subcategory] : [])],
    title: p.title,
    type: POST_TYPES.includes(p.type) ? p.type : 'question',
    authorName: (p.user_id && names.get(p.user_id)) || FALLBACK_AUTHOR,
    ago: timeAgo(p.created_at),
    views: p.views ?? 0,
    body: String(p.description ?? '').split(/\n{2,}/).map((s: string) => s.trim()).filter(Boolean),
    media: Array.isArray(p.media) ? p.media : [],
    commentsCount: counts.get(p.id) ?? 0,
    yesVotes: p.yes_votes ?? 0,
    noVotes: p.no_votes ?? 0,
  }));
}

export interface NewPostInput {
  title: string;
  category: string;
  subcategory?: string;
  type: PostType;
  body: string;
  mediaUrl?: string;
}

/** Új poszt mentése. Ha a bővített oszlopok (type/subcategory/media) még
 *  hiányoznak az adatbázisból, automatikusan visszaesik az alap mezőkre. */
export async function createPost(input: NewPostInput): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'Bejelentkezés szükséges a poszt létrehozásához.' };

  const base = {
    title: input.title.trim(),
    category: input.category,
    description: input.body.trim(),
    yes_votes: 0,
    no_votes: 0,
    user_id: session.user.id,
  };
  const rich = {
    ...base,
    type: input.type,
    subcategory: input.subcategory?.trim() || null,
    media: input.mediaUrl?.trim() ? [input.mediaUrl.trim()] : null,
  };

  let { error } = await (supabase.from('posts') as any).insert(rich);
  if (error && /column|schema cache/i.test(error.message)) {
    ({ error } = await (supabase.from('posts') as any).insert(base));
  }
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Egy poszt hozzászólásai (legfrissebb elöl). */
export async function fetchComments(postId: number): Promise<FeedComment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as any[];
  const names = await resolveUsernames(rows.map((r) => r.user_id));
  return rows.map((r) => ({
    id: r.id,
    username: (r.user_id && names.get(r.user_id)) || FALLBACK_AUTHOR,
    ago: timeAgo(r.created_at),
    body: String(r.content ?? ''),
  }));
}

/** Hozzászólás mentése a bejelentkezett felhasználó nevében. */
export async function addComment(postId: number, content: string): Promise<{ ok: boolean; error?: string; needsLogin?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true, error: 'A hozzászóláshoz jelentkezz be.' };
  const { error } = await (supabase.from('comments') as any).insert({
    post_id: postId,
    user_id: session.user.id,
    content: content.trim(),
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Szavazat leadása a meglévő /api/vote végponton (duplikátumot a DB tiltja). */
export async function castVote(postId: number, vote: 'yes' | 'no'): Promise<{ ok: boolean; already?: boolean; needsLogin?: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true };
  const res = await fetch('/api/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ post_id: postId, vote, user_id: session.user.id }),
  });
  if (res.status === 409) return { ok: false, already: true };
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    return { ok: false, error: d.error || 'Hiba a szavazáskor' };
  }
  return { ok: true };
}
