import { supabase } from './supabase';

// ============================================================
//  Mentett posztok.
//  - Bejelentkezve: a saved_posts táblában (fiókhoz kötve, minden eszközön).
//  - Kijelentkezve VAGY ha a tábla még nem létezik: localStorage (csak ebben
//    a böngészőben) — így semmi nem törik el az SQL lefuttatása előtt sem.
//  - Első bejelentkezett használatkor a helyi mentések átköltöznek a fiókba.
// ============================================================

const KEY = 'crowdmind_saved_posts';
const MIGRATED_KEY = 'crowdmind_saved_migrated';

function localIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const arr = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

function setLocalIds(ids: number[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // privát mód – nem baj
  }
}

async function currentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

/** A helyi (böngészős) mentések egyszeri átköltöztetése a fiókba. */
async function migrateLocalToDb(userId: string) {
  try {
    if (window.localStorage.getItem(MIGRATED_KEY)) return;
    const ids = localIds();
    if (ids.length > 0) {
      await (supabase.from('saved_posts') as any).upsert(
        ids.map((post_id) => ({ user_id: userId, post_id })),
        { onConflict: 'user_id,post_id', ignoreDuplicates: true },
      );
    }
    window.localStorage.setItem(MIGRATED_KEY, '1');
  } catch {
    // ha a tábla még nincs meg, később újra próbáljuk
  }
}

/** Az összes mentett poszt-azonosító (DB-ből, ha lehet; különben helyi). */
export async function getSavedIds(): Promise<number[]> {
  const userId = await currentUserId();
  if (!userId) return localIds();
  await migrateLocalToDb(userId);
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId);
  if (error) return localIds(); // tábla még nincs → helyi fallback
  return ((data ?? []) as { post_id: number }[]).map((r) => r.post_id);
}

/** Mentve van-e egy adott poszt. */
export async function isSaved(id: number): Promise<boolean> {
  return (await getSavedIds()).includes(id);
}

/** Mentés/visszavonás. Visszaadja az új állapotot (true = mentve). */
export async function toggleSaved(id: number): Promise<boolean> {
  const userId = await currentUserId();

  if (userId) {
    await migrateLocalToDb(userId);
    const { data } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', id)
      .maybeSingle();
    if (data) {
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', id);
      if (!error) return false;
    } else {
      const { error } = await (supabase.from('saved_posts') as any)
        .insert({ user_id: userId, post_id: id });
      if (!error) return true;
    }
    // DB-hiba (pl. tábla hiányzik) → helyi fallback jön lentebb
  }

  const ids = localIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  setLocalIds(next);
  return next.includes(id);
}
