import type { Metadata } from 'next';
import { fetchPostForSeo, fetchPostPageData, type PostPageSeoData } from '@/lib/seoPost';
import { SITE_URL } from '@/lib/publicConfig';
import { PostView } from './PostView';

/**
 * Szerver-komponens héj: a SEO-metaadatokat adja (cím, leírás, OG),
 * a tényleges UI a kliens-oldali PostView-ban él.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPostForSeo(Number(id));
  if (!post) {
    return { title: 'Téma nem található', robots: { index: false } };
  }

  const total = post.yesVotes + post.noVotes;
  const pct = total > 0 ? Math.round((post.yesVotes / total) * 100) : 50;
  const lead = post.description
    ? `${post.description.slice(0, 130).trim()}${post.description.length > 130 ? '…' : ''} `
    : '';
  // Jóslatnál a metaszöveg az állapotot tükrözi — lejárt kérdésre nem hívunk szavazni.
  const lejart = post.resolveAt !== null && new Date(post.resolveAt).getTime() <= Date.now();
  let zaras: string;
  if (post.type === 'prediction' && post.outcome) {
    zaras = `A jóslat eldőlt: ${post.outcome === 'yes' ? 'BEJÖTT' : 'NEM JÖTT BE'}. A tippelők ${pct}%-a mondott igent (${total} szavazat).`;
  } else if (post.type === 'prediction' && lejart) {
    zaras = `A szavazás lezárult, az eredmény rögzítésére vár — ${pct}% tippelt mellette (${total} szavazat).`;
  } else {
    zaras = `A közösség ${pct}%-a mellette (${total} szavazat). Szavazz te is a CrowdMind-on!`;
  }
  const description = lead + zaras;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/post/${post.id}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/post/${post.id}`,
      publishedTime: post.createdAt,
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

/**
 * schema.org DiscussionForumPosting jelölés a keresőknek: a kérdés, a szerző,
 * a szavazat-/hozzászólás-számok és maguk a hozzászólások is géppel olvashatók.
 * A `<` escape-elése kötelező, hogy felhasználói tartalom ne zárhassa le a scriptet.
 */
function buildJsonLd(data: PostPageSeoData): string {
  const { post, authorName, comments } = data;
  const url = `${SITE_URL}/post/${post.id}`;
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': url,
    url,
    headline: post.title.slice(0, 110),
    text: post.description || post.title,
    datePublished: post.createdAt,
    author: authorName
      ? { '@type': 'Person', name: authorName, url: `${SITE_URL}/user/${encodeURIComponent(authorName)}` }
      : { '@type': 'Organization', name: 'CrowdMind' },
    articleSection: post.category,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/VoteAction',
        userInteractionCount: post.yesVotes + post.noVotes,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: comments.length,
      },
    ],
    ...(comments.length > 0 && {
      comment: comments.slice(0, 25).map((c) => ({
        '@type': 'Comment',
        text: c.content,
        dateCreated: c.createdAt,
        author: { '@type': 'Person', name: c.author },
      })),
    }),
  };
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  const data = await fetchPostPageData(postId);
  return (
    <>
      {data && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(data) }} />
      )}
      <PostView id={postId} ssr={data} />
    </>
  );
}
