import { supabase } from './supabase';
import { timeAgo } from './timeAgo';
import { fetchCommentLikes } from './commentLikes';
import type { FeedPost, FeedComment, NotificationItem, PostType } from '@/data/types';

const POST_TYPES: PostType[] = [
  'question', 'debate', 'opinion', 'experience', 'comparison', 'poll', 'media', 'appreciation',
];

const FALLBACK_AUTHOR = 'CrowdMind tag';

/** user_id -> username tömeges feloldása a profiles táblából. */
async function resolveUsernames(userIds: (string | null | undefined)[]): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const unique = [...new Set(userIds.filter((x): x is string => Boolean(x)))];
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

/** post_id -> {yes,no} a votes táblából. A posts.yes_votes/no_votes számlálók
 *  frissítését az RLS blokkolja, ezért a votes tábla az igazság forrása;
 *  a régi (számlálóval seedelt) posztok értékei alapként adódnak hozzá. */
async function fetchVoteCounts(): Promise<Map<number, { yes: number; no: number }>> {
  const counts = new Map<number, { yes: number; no: number }>();
  const { data } = await supabase.from('votes').select('post_id,vote');
  ((data ?? []) as any[]).forEach((v) => {
    if (v.vote !== 'yes' && v.vote !== 'no') return; // régi formátumú sorok kihagyása
    const c = counts.get(v.post_id) ?? { yes: 0, no: 0 };
    if (v.vote === 'yes') c.yes += 1; else c.no += 1;
    counts.set(v.post_id, c);
  });
  return counts;
}

function mapRow(p: any, commentsCount: number, names: Map<string, string>, votes?: { yes: number; no: number }): FeedPost {
  return {
    id: p.id,
    category: [p.category || 'Általános', ...(p.subcategory ? [p.subcategory] : [])],
    title: p.title,
    type: POST_TYPES.includes(p.type) ? p.type : 'question',
    authorId: p.user_id ?? null,
    authorName: (p.user_id && names.get(p.user_id)) || FALLBACK_AUTHOR,
    ago: timeAgo(p.created_at),
    createdAt: p.created_at,
    views: p.views ?? 0,
    body: String(p.description ?? '').split(/\n{2,}/).map((s: string) => s.trim()).filter(Boolean),
    media: Array.isArray(p.media) ? p.media : [],
    commentsCount,
    yesVotes: (p.yes_votes ?? 0) + (votes?.yes ?? 0),
    noVotes: (p.no_votes ?? 0) + (votes?.no ?? 0),
  };
}

/** Az összes poszt betöltése (legfrissebb elöl), szerzőnevekkel és kommentszámmal. */
export async function fetchFeedPosts(): Promise<FeedPost[]> {
  const { data: rows, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const posts = (rows ?? []) as any[];

  const { data: commentRows } = await supabase.from('comments').select('post_id');
  const counts = new Map<number, number>();
  ((commentRows ?? []) as any[]).forEach((c) => {
    counts.set(c.post_id, (counts.get(c.post_id) ?? 0) + 1);
  });

  const [names, voteCounts] = await Promise.all([
    resolveUsernames(posts.map((p) => p.user_id)),
    fetchVoteCounts(),
  ]);
  return posts.map((p) => mapRow(p, counts.get(p.id) ?? 0, names, voteCounts.get(p.id)));
}

/** Egyetlen poszt betöltése azonosító alapján (poszt-aloldalhoz). */
export async function fetchPostById(id: number): Promise<FeedPost | null> {
  const { data: p, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!p) return null;
  const [{ count }, names, voteCounts] = await Promise.all([
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', id),
    resolveUsernames([(p as any).user_id]),
    fetchVoteCounts(),
  ]);
  return mapRow(p, count ?? 0, names, voteCounts.get(id));
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

  let { data: created, error } = await (supabase.from('posts') as any).insert(rich).select('id').single();
  if (error && /column|schema cache/i.test(error.message)) {
    ({ data: created, error } = await (supabase.from('posts') as any).insert(base).select('id').single());
  }
  if (error) return { ok: false, error: error.message };

  // Visszatérési horog: értesítjük azokat, akik követik ezt a kategóriát
  // (max 50 fő, best-effort — hiba esetén a poszt attól még létrejött).
  if (created?.id) {
    void notifyCategoryFollowers(created.id, input.category, base.title, session.user.id);
  }
  return { ok: true };
}

/** Értesítés a kategória követőinek egy új témáról. */
async function notifyCategoryFollowers(postId: number, category: string, title: string, authorId: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('user_id')
      .contains('preferred_categories', [category])
      .neq('user_id', authorId)
      .limit(50);
    const followers = ((data ?? []) as { user_id: string }[]).map((f) => f.user_id);
    if (followers.length === 0) return;
    await (supabase.from('notifications') as any).insert(
      followers.map((user_id) => ({
        user_id,
        post_id: postId,
        message: `Új téma a követett ${category} kategóriádban: „${title}”`,
        read: false,
      })),
    );
  } catch {
    // nem kritikus
  }
}

/** Saját poszt törlése. A user_id-szűrés garantálja, hogy csak a sajátodat törölheted. */
export async function deleteOwnPost(postId: number): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'Bejelentkezés szükséges' };
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', session.user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Saját hozzászólás törlése (csak a sajátodat). */
export async function deleteOwnComment(commentId: number): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'Bejelentkezés szükséges' };
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', session.user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Egy poszt hozzászólásai (legfrissebb elöl), lájk-számokkal. */
export async function fetchComments(postId: number): Promise<FeedComment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as any[];
  const [names, likes] = await Promise.all([
    resolveUsernames(rows.map((r) => r.user_id)),
    fetchCommentLikes(rows.map((r) => r.id)),
  ]);
  return rows.map((r) => {
    const like = likes.get(r.id);
    return {
      id: r.id,
      userId: r.user_id ?? null,
      username: (r.user_id && names.get(r.user_id)) || FALLBACK_AUTHOR,
      ago: timeAgo(r.created_at),
      body: String(r.content ?? ''),
      likes: like?.count ?? 0,
      likedByMe: like?.likedByMe ?? false,
    };
  });
}

/** Értesítés létrehozása a poszt tulajdonosának (best-effort: hiba esetén csendben kihagyjuk). */
async function notifyPostOwner(postId: number, actorId: string, buildMessage: (title: string, actorName: string) => string) {
  try {
    const { data: post } = await supabase
      .from('posts')
      .select('user_id,title')
      .eq('id', postId)
      .maybeSingle();
    const owner = (post as any)?.user_id as string | null;
    if (!owner || owner === actorId) return; // saját magunknak nem küldünk
    const names = await resolveUsernames([actorId]);
    const actorName = names.get(actorId) ?? FALLBACK_AUTHOR;
    await (supabase.from('notifications') as any).insert({
      user_id: owner,
      post_id: postId,
      message: buildMessage(String((post as any)?.title ?? ''), actorName),
      read: false,
    });
  } catch {
    // az értesítés nem kritikus – a fő művelet ettől még sikeres
  }
}

/** Hozzászólás mentése a bejelentkezett felhasználó nevében (+ értesítés a poszt gazdájának és a téma követőinek). */
export async function addComment(postId: number, content: string): Promise<{ ok: boolean; error?: string; needsLogin?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true, error: 'A hozzászóláshoz jelentkezz be.' };
  const { error } = await (supabase.from('comments') as any).insert({
    post_id: postId,
    user_id: session.user.id,
    content: content.trim(),
  });
  if (error) return { ok: false, error: error.message };
  void notifyPostOwner(postId, session.user.id, (title, actor) => `${actor} hozzászólt a témádhoz: „${title}”`);
  void notifyPostFollowers(postId, session.user.id);
  return { ok: true };
}

/** Értesítés a téma követőinek egy új hozzászólásról (max 50 fő, best-effort).
 *  A poszt gazdáját kihagyjuk — ő a notifyPostOwner útján már kap értesítést. */
async function notifyPostFollowers(postId: number, actorId: string) {
  try {
    const [{ data: post }, { data: followRows }] = await Promise.all([
      supabase.from('posts').select('user_id,title').eq('id', postId).maybeSingle(),
      supabase.from('post_follows').select('user_id').eq('post_id', postId).neq('user_id', actorId).limit(50),
    ]);
    const owner = (post as any)?.user_id as string | null;
    const title = String((post as any)?.title ?? '');
    const targets = ((followRows ?? []) as { user_id: string }[])
      .map((f) => f.user_id)
      .filter((id) => id !== owner);
    if (targets.length === 0) return;
    const names = await resolveUsernames([actorId]);
    const actorName = names.get(actorId) ?? FALLBACK_AUTHOR;
    await (supabase.from('notifications') as any).insert(
      targets.map((user_id) => ({
        user_id,
        post_id: postId,
        message: `${actorName} hozzászólt egy követett témádhoz: „${title}”`,
        read: false,
      })),
    );
  } catch {
    // az értesítés nem kritikus – a hozzászólás ettől még sikeres
  }
}

/** Szavazat leadása a meglévő /api/vote végponton (duplikátumot a DB tiltja).
 *  A `standing` (pl. "62% mellette") bekerül a téma gazdájának értesítésébe —
 *  így az értesítés önmagában is elmondja, merre fordult a téma. */
export async function castVote(postId: number, vote: 'yes' | 'no', standing?: string): Promise<{ ok: boolean; already?: boolean; needsLogin?: boolean; error?: string }> {
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
  void notifyPostOwner(postId, session.user.id, (title) =>
    standing
      ? `Új szavazat a témádra: „${title}” — állás: ${standing}`
      : `Új szavazat érkezett a témádra: „${title}”`,
  );
  return { ok: true };
}

/** Egy pont a vélemény-idővonalon. */
export interface TimelinePoint {
  t: string;       // időbélyeg (ISO)
  forPct: number;  // támogatottság % ebben a pillanatban
  total: number;   // összes szavazat eddig a pontig
}

/**
 * VÉLEMÉNY-IDŐVONAL egy témához — a votes tábla időbélyeges szavazataiból
 * visszaépítve. A poszt beégetett kezdő-számlálói adják az alapvonalat,
 * onnantól minden szavazat egy-egy pont. Új tábla nem kell: az adat magától
 * gyűlik minden szavazattal.
 */
export async function fetchOpinionTimeline(postId: number): Promise<TimelinePoint[]> {
  const [{ data: post }, { data: voteRows }] = await Promise.all([
    supabase.from('posts').select('created_at,yes_votes,no_votes').eq('id', postId).maybeSingle(),
    supabase.from('votes').select('vote,created_at').eq('post_id', postId).order('created_at', { ascending: true }),
  ]);
  if (!post) return [];

  let yes = (post as any).yes_votes ?? 0;
  let no = (post as any).no_votes ?? 0;
  const points: TimelinePoint[] = [];
  const push = (t: string) => {
    const total = yes + no;
    points.push({ t, forPct: total > 0 ? Math.round((yes / total) * 100) : 50, total });
  };
  push((post as any).created_at);

  ((voteRows ?? []) as any[]).forEach((v) => {
    if (v.vote === 'yes') yes += 1;
    else if (v.vote === 'no') no += 1;
    else return; // régi formátumú szavazatok (home/away/draw) kihagyva
    push(v.created_at);
  });

  // Ha nagyon sok a pont, ritkítjuk (az első és utolsó mindig marad).
  if (points.length > 80) {
    const step = Math.ceil(points.length / 80);
    return points.filter((_, i) => i % step === 0 || i === points.length - 1);
  }
  return points;
}

/**
 * PLATFORM-SZINTŰ napi hangulat-idővonal — az összes valódi szavazatból,
 * naponta összegezve (kumulatív támogatottság a nap végén).
 */
export async function fetchPlatformTimeline(): Promise<{ day: string; forPct: number; total: number }[]> {
  const { data } = await supabase
    .from('votes')
    .select('vote,created_at')
    .order('created_at', { ascending: true })
    .limit(5000);
  const rows = ((data ?? []) as any[]).filter((v) => v.vote === 'yes' || v.vote === 'no');
  if (rows.length === 0) return [];

  const byDay = new Map<string, { yes: number; no: number }>();
  let yes = 0;
  let no = 0;
  rows.forEach((v) => {
    if (v.vote === 'yes') yes += 1; else no += 1;
    byDay.set(String(v.created_at).slice(0, 10), { yes, no });
  });
  return [...byDay.entries()].map(([day, c]) => ({
    day,
    forPct: Math.round((c.yes / (c.yes + c.no)) * 100),
    total: c.yes + c.no,
  }));
}

/** A bejelentkezett felhasználó értesítései (legfrissebb elöl). */
export async function fetchNotifications(): Promise<NotificationItem[] | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null; // nincs belépve
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((n) => ({
    id: n.id,
    message: String(n.message ?? ''),
    ago: timeAgo(n.created_at),
    read: Boolean(n.read),
    postId: n.post_id ?? null,
  }));
}

/** Minden értesítés olvasottnak jelölése. */
export async function markAllNotificationsRead(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await (supabase.from('notifications') as any)
    .update({ read: true })
    .eq('user_id', session.user.id)
    .eq('read', false);
}

/** A bejelentkezett felhasználó aktivitás-összesítője (Értesítések oldal jobb paneljéhez). */
export async function fetchMyEngagement(): Promise<{ myPosts: number; commentsReceived: number; votesReceived: number } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: myPosts } = await supabase.from('posts').select('id').eq('user_id', session.user.id);
  const ids = ((myPosts ?? []) as any[]).map((p) => p.id);
  if (ids.length === 0) return { myPosts: 0, commentsReceived: 0, votesReceived: 0 };
  const { count: commentsReceived } = await supabase
    .from('comments').select('id', { count: 'exact', head: true }).in('post_id', ids);
  const { count: votesReceived } = await supabase
    .from('votes').select('id', { count: 'exact', head: true }).in('post_id', ids);
  return {
    myPosts: ids.length,
    commentsReceived: commentsReceived ?? 0,
    votesReceived: votesReceived ?? 0,
  };
}
