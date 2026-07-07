/**
 * Publikus konfiguráció — kliens és szerver oldalon is használható.
 * Az anon kulcs szándékosan publikus (RLS védi az adatokat), a SEO-kód
 * (generateMetadata, OG-kép, sitemap) innen éri el a REST API-t anélkül,
 * hogy a teljes supabase-js klienst be kellene húznia.
 */
export const SUPABASE_URL = 'https://nlysintxbdetoybbbnnb.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seXNpbnR4YmRldG95YmJibm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzgzOTMsImV4cCI6MjA5NzQ1NDM5M30._j1KYimL8vX4P5ydtbu4PrsnREdWwPrpiKt6A1bv4xc';

/** Az oldal kanonikus címe — sitemap, OG-url és beágyazási kód alapja. */
export const SITE_URL = 'https://crowdmind.dev';

/** Egyszerű REST-lekérés a Supabase-hez (szerver-oldali SEO-kódnak). */
export async function sbRest<T>(pathAndQuery: string, revalidateSeconds = 300): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
