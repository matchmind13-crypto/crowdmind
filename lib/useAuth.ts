'use client';
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
}

/**
 * A jelenlegi bejelentkezett felhasználó állapota.
 * Figyeli a Supabase session-t, és betölti a hozzá tartozó felhasználónevet a profiles táblából.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadFromSession(session: { user?: { id: string; email?: string } } | null) {
      if (!session?.user) {
        if (active) { setUser(null); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (active) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
          username: (data as { username?: string } | null)?.username ?? null,
        });
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => loadFromSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => loadFromSession(session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return { user, loading, signOut };
}
