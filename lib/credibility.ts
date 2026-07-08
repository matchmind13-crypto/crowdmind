import { supabase } from './supabase';

/**
 * Hitelesség-szint a valódi aktivitásból: hány témát + hozzászólást adott
 * a felhasználó a közösségnek. Nem kell hozzá új tábla — a posts és comments
 * táblából számolódik, munkamenet-szintű gyorsítótárral.
 */

export type CredTier = 'uj' | 'aktiv' | 'torzs';

export function tierFor(contributions: number): CredTier {
  if (contributions >= 15) return 'torzs';
  if (contributions >= 4) return 'aktiv';
  return 'uj';
}

// Munkamenet-szintű cache, hogy a feedben ne kérdezzük le ugyanazt a szerzőt többször.
const cache = new Map<string, number>();

export async function fetchContributionCounts(userIds: string[]): Promise<Map<string, number>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const missing = unique.filter((id) => !cache.has(id));

  if (missing.length > 0) {
    try {
      const list = `(${missing.join(',')})`;
      const [{ data: posts }, { data: comments }] = await Promise.all([
        supabase.from('posts').select('user_id').filter('user_id', 'in', list),
        supabase.from('comments').select('user_id').filter('user_id', 'in', list),
      ]);
      const counts = new Map<string, number>();
      [...((posts ?? []) as any[]), ...((comments ?? []) as any[])].forEach((r) => {
        counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1);
      });
      missing.forEach((id) => cache.set(id, counts.get(id) ?? 0));
    } catch {
      missing.forEach((id) => cache.set(id, 0));
    }
  }

  return new Map(unique.map((id) => [id, cache.get(id) ?? 0]));
}
