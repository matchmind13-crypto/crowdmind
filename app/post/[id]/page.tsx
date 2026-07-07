import type { Metadata } from 'next';
import { fetchPostForSeo } from '@/lib/seoPost';
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
  const description =
    (post.description ? `${post.description.slice(0, 130).trim()}${post.description.length > 130 ? '…' : ''} ` : '') +
    `A közösség ${pct}%-a mellette (${total} szavazat). Szavazz te is a CrowdMind-on!`;

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

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostView id={Number(id)} />;
}
