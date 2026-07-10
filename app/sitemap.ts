import type { MetadataRoute } from 'next';
import { sbRest, SITE_URL } from '@/lib/publicConfig';

/**
 * Sitemap a Google-nek: statikus oldalak + minden téma saját URL-je.
 * Óránként frissül (revalidate a sbRest-ben), így az új témák hamar bekerülnek.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts =
    (await sbRest<{ id: number; created_at: string }[]>(
      'posts?select=id,created_at&order=created_at.desc&limit=1000',
      3600
    )) ?? [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/discover`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/trending`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/fresh`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE_URL}/sentiment`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/ma`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/toplista`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/rolunk`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/szabalyzat`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/post/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}
