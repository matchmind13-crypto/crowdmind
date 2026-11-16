import { sbRest } from './publicConfig';

/**
 * Szerver-oldali poszt-lekérés a SEO-hoz (generateMetadata + OG-kép).
 * A szavazatszám ugyanúgy számolódik, mint a kliensen (lib/postsDb):
 * a posts-beli régi számlálók az alap, plusz a votes tábla valódi sorai.
 */
export interface SeoPost {
  id: number;
  title: string;
  description: string;
  category: string;
  yesVotes: number;
  noVotes: number;
  createdAt: string;
  /** 'prediction' a jóslatoknál — a metaszöveg állapot-függő. */
  type: string | null;
  resolveAt: string | null;
  outcome: 'yes' | 'no' | null;
  userId: string | null;
}

interface PostRow {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  yes_votes: number | null;
  no_votes: number | null;
  created_at: string;
  type: string | null;
  resolve_at: string | null;
  outcome: string | null;
  user_id: string | null;
}

export async function fetchPostForSeo(id: number): Promise<SeoPost | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const [postRows, voteRows] = await Promise.all([
    sbRest<PostRow[]>(
      `posts?id=eq.${id}&select=id,title,description,category,yes_votes,no_votes,created_at,type,resolve_at,outcome,user_id&limit=1`,
    ),
    sbRest<{ vote: string }[]>(`votes?post_id=eq.${id}&select=vote`),
  ]);
  const post = postRows?.[0];
  if (!post) return null;

  let yes = post.yes_votes ?? 0;
  let no = post.no_votes ?? 0;
  (voteRows ?? []).forEach((v) => {
    if (v.vote === 'yes') yes += 1;
    else if (v.vote === 'no') no += 1;
  });

  return {
    id: post.id,
    title: post.title,
    description: post.description ?? '',
    category: post.category ?? 'Közélet',
    yesVotes: yes,
    noVotes: no,
    createdAt: post.created_at,
    type: post.type,
    resolveAt: post.resolve_at,
    outcome: post.outcome === 'yes' || post.outcome === 'no' ? post.outcome : null,
    userId: post.user_id,
  };
}

/** Egy hozzászólás szerver-oldali, SEO-barát alakja. */
export interface SeoComment {
  author: string;
  content: string;
  createdAt: string;
}

export interface PostPageSeoData {
  post: SeoPost;
  /** A poszt szerzőjének felhasználóneve, vagy null, ha nem feloldható. */
  authorName: string | null;
  comments: SeoComment[];
}

interface CommentRow {
  user_id: string | null;
  content: string | null;
  created_at: string;
}

/**
 * A poszt-oldal szerver-renderelt tartalmához: poszt + hozzászólások + szerzőnevek.
 * A fetchPostForSeo hívását a Next kérésen belüli fetch-memoizációja dedupolja
 * a generateMetadata-beli hívással (azonos REST-URL).
 */
export async function fetchPostPageData(id: number): Promise<PostPageSeoData | null> {
  const post = await fetchPostForSeo(id);
  if (!post) return null;

  const commentRows =
    (await sbRest<CommentRow[]>(
      `comments?post_id=eq.${id}&select=user_id,content,created_at&order=created_at.asc&limit=100`,
    )) ?? [];

  const userIds = new Set<string>();
  if (post.userId) userIds.add(post.userId);
  commentRows.forEach((c) => { if (c.user_id) userIds.add(c.user_id); });

  let names = new Map<string, string>();
  if (userIds.size > 0) {
    const profiles = await sbRest<{ user_id: string; username: string }[]>(
      `profiles?user_id=in.(${[...userIds].join(',')})&select=user_id,username`,
    );
    names = new Map((profiles ?? []).map((p) => [p.user_id, p.username]));
  }

  return {
    post,
    authorName: (post.userId && names.get(post.userId)) || null,
    comments: commentRows
      .filter((c) => typeof c.content === 'string' && c.content.trim().length > 0)
      .map((c) => ({
        author: (c.user_id && names.get(c.user_id)) || 'CrowdMind-tag',
        content: (c.content as string).trim(),
        createdAt: c.created_at,
      })),
  };
}
