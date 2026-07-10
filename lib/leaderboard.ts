import { supabase } from './supabase';

// ============================================================
//  TOPLISTA – valódi adatból számolt rangsorok:
//  - Legjobb jósok: a LEZÁRT jóslatokra leadott szavazatokból
//    (találat = a szavazat egyezik az eredménnyel)
//  - Legaktívabbak: posztok + hozzászólások száma
//  A hivatalos szerkesztői fiók (crowdmind) nem versenyez.
// ============================================================

export interface PredictorRow {
  userId: string;
  username: string;
  avatarUrl: string | null;
  hits: number;
  total: number;
}

export interface ActiveRow {
  userId: string;
  username: string;
  avatarUrl: string | null;
  posts: number;
  comments: number;
  score: number;
}

export interface Leaderboard {
  predictors: PredictorRow[];
  actives: ActiveRow[];
}

const OFFICIAL_USERNAME = 'crowdmind';

export async function fetchLeaderboard(limit = 10): Promise<Leaderboard> {
  // 1) Lezárt jóslatok és a rájuk leadott szavazatok
  const { data: resolvedRows } = await supabase
    .from('posts')
    .select('id,outcome')
    .not('outcome', 'is', null);
  const resolved = (resolvedRows ?? []) as { id: number; outcome: 'yes' | 'no' }[];
  const outcomeById = new Map(resolved.map((p) => [p.id, p.outcome]));

  const predictorStats = new Map<string, { hits: number; total: number }>();
  if (resolved.length > 0) {
    const { data: voteRows } = await supabase
      .from('votes')
      .select('post_id,user_id,vote')
      .in('post_id', resolved.map((p) => p.id));
    for (const v of (voteRows ?? []) as { post_id: number; user_id: string | null; vote: string }[]) {
      if (!v.user_id || (v.vote !== 'yes' && v.vote !== 'no')) continue;
      const s = predictorStats.get(v.user_id) ?? { hits: 0, total: 0 };
      s.total += 1;
      if (v.vote === outcomeById.get(v.post_id)) s.hits += 1;
      predictorStats.set(v.user_id, s);
    }
  }

  // 2) Aktivitás: posztok + hozzászólások szerzőnként
  const [{ data: postRows }, { data: commentRows }] = await Promise.all([
    supabase.from('posts').select('user_id').not('user_id', 'is', null),
    supabase.from('comments').select('user_id').not('user_id', 'is', null),
  ]);
  const postCounts = new Map<string, number>();
  for (const r of (postRows ?? []) as { user_id: string }[]) {
    postCounts.set(r.user_id, (postCounts.get(r.user_id) ?? 0) + 1);
  }
  const commentCounts = new Map<string, number>();
  for (const r of (commentRows ?? []) as { user_id: string }[]) {
    commentCounts.set(r.user_id, (commentCounts.get(r.user_id) ?? 0) + 1);
  }

  // 3) Nevek és profilképek egy körben
  const userIds = [
    ...new Set([...predictorStats.keys(), ...postCounts.keys(), ...commentCounts.keys()]),
  ];
  const names = new Map<string, { username: string; avatarUrl: string | null }>();
  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('user_id,username,avatar_url')
      .in('user_id', userIds);
    for (const p of (profileRows ?? []) as { user_id: string; username: string; avatar_url?: string | null }[]) {
      names.set(p.user_id, { username: p.username, avatarUrl: p.avatar_url ?? null });
    }
  }

  const isRanked = (userId: string) => {
    const n = names.get(userId);
    return !!n && n.username !== OFFICIAL_USERNAME;
  };

  const predictors: PredictorRow[] = [...predictorStats.entries()]
    .filter(([userId]) => isRanked(userId))
    .map(([userId, s]) => ({
      userId,
      username: names.get(userId)!.username,
      avatarUrl: names.get(userId)!.avatarUrl,
      hits: s.hits,
      total: s.total,
    }))
    .sort((a, b) => b.hits - a.hits || b.hits / b.total - a.hits / a.total || b.total - a.total)
    .slice(0, limit);

  const actives: ActiveRow[] = userIds
    .filter((userId) => isRanked(userId))
    .map((userId) => {
      const posts = postCounts.get(userId) ?? 0;
      const comments = commentCounts.get(userId) ?? 0;
      return {
        userId,
        username: names.get(userId)!.username,
        avatarUrl: names.get(userId)!.avatarUrl,
        posts,
        comments,
        score: posts * 2 + comments,
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { predictors, actives };
}
