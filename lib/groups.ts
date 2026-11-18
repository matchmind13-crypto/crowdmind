import { supabase } from './supabase';

/**
 * Valódi csoportok adatrétege (groups + group_members táblák).
 * A táblák létrejöttéig minden függvény kegyesen üres/„hamarosan" választ ad.
 */

export interface GroupInfo {
  id: number;
  name: string;
  description: string | null;
  creatorId: string;
  createdAt: string;
  members: number;
  /** A csoport tetejére kitűzött téma (a létrehozó állítja); a migrációig null. */
  pinnedPostId: number | null;
}

function tableMissing(message?: string | null) {
  return !!message && /relation|does not exist|schema cache/i.test(message);
}

let cache: { groups: GroupInfo[]; at: number } | null = null;

/** A tárolt csoport-lista érvénytelenítése (létrehozás/csatlakozás után). */
export function resetGroupsCache() {
  cache = null;
}

/** Az összes csoport taglétszámmal (60 mp-es cache-sel). */
export async function fetchGroups(): Promise<GroupInfo[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.groups;
  // A pinned_post_id oszlop a moderációs migrációval jön — addig a régi oszloplistára
  // esünk vissza, hogy a csoportok enélkül is betöltsenek.
  let groupRes = await supabase
    .from('groups')
    .select('id,name,description,creator_id,created_at,pinned_post_id')
    .order('created_at', { ascending: true });
  if (groupRes.error) {
    groupRes = await supabase
      .from('groups')
      .select('id,name,description,creator_id,created_at')
      .order('created_at', { ascending: true });
  }
  if (groupRes.error) return []; // a tábla még nem létezik
  const { data: memberRows } = await supabase.from('group_members').select('group_id');
  const counts = new Map<number, number>();
  ((memberRows ?? []) as { group_id: number }[]).forEach((m) => {
    counts.set(m.group_id, (counts.get(m.group_id) ?? 0) + 1);
  });
  const groups = ((groupRes.data ?? []) as any[]).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description ?? null,
    creatorId: g.creator_id,
    createdAt: g.created_at,
    members: counts.get(g.id) ?? 0,
    pinnedPostId: (g.pinned_post_id as number | null | undefined) ?? null,
  }));
  cache = { groups, at: Date.now() };
  return groups;
}

export async function fetchGroupByName(name: string): Promise<GroupInfo | null> {
  const groups = await fetchGroups();
  return groups.find((g) => g.name === name) ?? null;
}

/** Új csoport létrehozása — a létrehozó automatikusan tag is lesz. */
export async function createGroup(
  name: string,
  description: string,
): Promise<{ ok: boolean; error?: string; needsLogin?: boolean; group?: GroupInfo }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true, error: 'A csoport-létrehozáshoz jelentkezz be.' };
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 40) {
    return { ok: false, error: 'A csoportnév 3–40 karakter legyen.' };
  }

  const { data, error } = await (supabase.from('groups') as any)
    .insert({ name: trimmed, description: description.trim() || null, creator_id: session.user.id })
    .select('id,name,description,creator_id,created_at')
    .single();
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Már van ilyen nevű csoport.' };
    if (tableMissing(error.message)) return { ok: false, error: 'A csoportok most nem érhetők el — próbáld újra később.' };
    return { ok: false, error: 'A létrehozás nem sikerült.' };
  }

  // A létrehozó automatikusan tag (best-effort).
  await (supabase.from('group_members') as any).insert({
    group_id: (data as any).id,
    user_id: session.user.id,
  }).then(() => undefined, () => undefined);

  resetGroupsCache();
  return {
    ok: true,
    group: {
      id: (data as any).id,
      name: (data as any).name,
      description: (data as any).description ?? null,
      creatorId: (data as any).creator_id,
      createdAt: (data as any).created_at,
      members: 1,
      pinnedPostId: null,
    },
  };
}

/**
 * A csoport leírásának mentése — csak a létrehozónak engedi az RLS.
 * A 0 frissített sor is hibának számít (nincs jogosultság VAGY a moderációs
 * SQL még nincs lefuttatva), különben némán „sikerülne” a semmi.
 */
export async function updateGroupDescription(
  groupId: number,
  description: string,
): Promise<{ ok: boolean; error?: string; needsLogin?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true, error: 'A szerkesztéshez jelentkezz be.' };
  const { data, error } = await (supabase.from('groups') as any)
    .update({ description: description.trim() || null })
    .eq('id', groupId)
    .select('id');
  if (error) return { ok: false, error: 'A mentés nem sikerült — próbáld újra később.' };
  if (!data || data.length === 0) {
    return { ok: false, error: 'A mentés nem ment át — csak a csoport létrehozója szerkeszthet.' };
  }
  resetGroupsCache();
  return { ok: true };
}

/** Téma kitűzése a csoport tetejére (null = kitűzés levétele) — csak a létrehozónak. */
export async function setGroupPinnedPost(
  groupId: number,
  postId: number | null,
): Promise<{ ok: boolean; error?: string; needsLogin?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true, error: 'A kitűzéshez jelentkezz be.' };
  const { data, error } = await (supabase.from('groups') as any)
    .update({ pinned_post_id: postId })
    .eq('id', groupId)
    .select('id');
  if (error) {
    if (/pinned_post_id|column/i.test(error.message ?? '')) {
      return { ok: false, error: 'A kitűzés még nincs bekapcsolva ezen az oldalon.' };
    }
    return { ok: false, error: 'A kitűzés nem sikerült — próbáld újra később.' };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'A kitűzés nem ment át — csak a csoport létrehozója tűzhet ki.' };
  }
  resetGroupsCache();
  return { ok: true };
}

export async function isGroupMember(groupId: number): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', session.user.id)
    .maybeSingle();
  return !error && !!data;
}

export async function toggleGroupMembership(
  groupId: number,
): Promise<{ member: boolean; needsLogin?: boolean; unavailable?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { member: false, needsLogin: true };

  const member = await isGroupMember(groupId);
  if (member) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', session.user.id);
    if (error) return { member: true, unavailable: tableMissing(error.message) };
    resetGroupsCache();
    return { member: false };
  }
  const { error } = await (supabase.from('group_members') as any).insert({
    group_id: groupId,
    user_id: session.user.id,
  });
  if (error && error.code !== '23505') {
    return { member: false, unavailable: tableMissing(error.message) };
  }
  resetGroupsCache();
  return { member: true };
}
