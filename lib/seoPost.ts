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
}

interface PostRow {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  yes_votes: number | null;
  no_votes: number | null;
  created_at: string;
}

export async function fetchPostForSeo(id: number): Promise<SeoPost | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const [postRows, voteRows] = await Promise.all([
    sbRest<PostRow[]>(`posts?id=eq.${id}&select=id,title,description,category,yes_votes,no_votes,created_at&limit=1`),
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
  };
}
