// ============================================================
//  Mentett posztok tárolása.
//
//  FIGYELEM (mock-jellegű megoldás): a mentések jelenleg CSAK ebben a
//  böngészőben tárolódnak (localStorage), nem az adatbázisban.
//  KÉSŐBB CSERÉLENDŐ valódi Supabase táblára
//  (pl. saved_posts: user_id uuid, post_id bigint, unique(user_id, post_id)),
//  hogy a mentések eszközök között is szinkronizálódjanak.
// ============================================================

const KEY = 'crowdmind_saved_posts';

export function getSavedIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

export function isSaved(id: number): boolean {
  return getSavedIds().includes(id);
}

/** Mentés/visszavonás. Visszaadja az új állapotot (true = mentve). */
export function toggleSaved(id: number): boolean {
  const ids = getSavedIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // pl. privát mód – csendben kihagyjuk
  }
  return next.includes(id);
}
