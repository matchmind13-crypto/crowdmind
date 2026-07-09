'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/**
 * A bejelentkezett felhasználó profilképe — modul-szintű gyorsítótárral,
 * hogy a sok példányban élő komponensek (pl. komment-írósor) ne kérdezzék
 * le újra és újra.
 */
let cached: { userId: string; url: string | null } | null = null;

/** Új kép feltöltése/törlése után hívandó, hogy a következő olvasás friss legyen. */
export function resetMyAvatarCache() {
  cached = null;
}

export function useMyAvatar(): string | null {
  const [url, setUrl] = useState<string | null>(cached?.url ?? null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (active) setUrl(null); return; }
      if (cached && cached.userId === session.user.id) {
        if (active) setUrl(cached.url);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', session.user.id)
        .maybeSingle();
      const u = error ? null : (((data as any)?.avatar_url as string | null) ?? null);
      cached = { userId: session.user.id, url: u };
      if (active) setUrl(u);
    })();
    return () => { active = false; };
  }, []);

  return url;
}
