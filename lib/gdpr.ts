import { supabase } from './supabase';

/**
 * GDPR: a bejelentkezett felhasználó ÖSSZES adatának exportja JSON-ban
 * (hozzáférés + adathordozhatóság joga). Minden lekérdezés a saját session
 * jogosultságával fut — az RLS garantálja, hogy csak a sajátodat kapod.
 */
export async function exportMyData(): Promise<{ ok: boolean; needsLogin?: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true };
  const uid = session.user.id;

  const grab = async (table: string, column = 'user_id') => {
    try {
      const { data, error } = await supabase.from(table).select('*').eq(column, uid);
      if (error) return { error: error.message };
      return data ?? [];
    } catch {
      return { error: 'nem elérhető' };
    }
  };

  const [profile, posts, comments, votes, saved, follows, likes, reports, notifications] =
    await Promise.all([
      grab('profiles'),
      grab('posts'),
      grab('comments'),
      grab('votes'),
      grab('saved_posts'),
      grab('post_follows'),
      grab('comment_likes'),
      grab('reports', 'reporter_id'),
      grab('notifications'),
    ]);

  const payload = {
    exportalva: new Date().toISOString(),
    fiok: { id: uid, email: session.user.email },
    profil: profile,
    temaim: posts,
    hozzaszolasaim: comments,
    szavazataim: votes,
    mentett_temak: saved,
    kovetett_temak: follows,
    komment_lajkjaim: likes,
    jelenteseim: reports,
    ertesitesek: notifications,
  };

  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crowdmind-adataim-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch {
    return { ok: false, error: 'A letöltés nem indult el.' };
  }
}

/** Fiók végleges törlése a szerver-oldali végponton keresztül. */
export async function deleteMyAccount(): Promise<{ ok: boolean; needsLogin?: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true };

  const res = await fetch('/api/delete-account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    return { ok: false, error: d.error ?? 'A törlés nem sikerült — próbáld újra később.' };
  }
  await supabase.auth.signOut();
  return { ok: true };
}
