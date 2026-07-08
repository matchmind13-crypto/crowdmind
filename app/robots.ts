import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/publicConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // API-végpontok és privát oldalak nem valók a keresőbe.
      disallow: ['/api/', '/notifications', '/saved', '/profile', '/reset-password', '/embed/', '/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
