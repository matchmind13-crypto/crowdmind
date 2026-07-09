import { supabase } from './supabase';

/**
 * Csoport-taglétszámok (kategória-követők) egyetlen lekérdezésből,
 * modul-szintű gyorsítótárral — a feed minden kártyája ebből olvas.
 */
let cache: Map<string, number> | null = null;
let inflight: Promise<Map<string, number>> | null = null;

export async function fetchGroupMemberCounts(): Promise<Map<string, number>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const counts = new Map<string, number>();
    try {
      const { data } = await supabase.from('profiles').select('preferred_categories');
      ((data ?? []) as { preferred_categories: string[] | null }[]).forEach((p) => {
        (p.preferred_categories ?? []).forEach((cat) => {
          counts.set(cat, (counts.get(cat) ?? 0) + 1);
        });
      });
    } catch {
      // üres térképpel megyünk tovább
    }
    cache = counts;
    inflight = null;
    return counts;
  })();
  return inflight;
}
