'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface PreferencesContextValue {
  userId: string | null;
  /** A kiválasztott kategóriák; null = nincs egyéni hírfolyam (minden téma látszik). */
  preferred: string[] | null;
  loading: boolean;
  /** true, ha a preferred_categories oszlop még nem létezik a DB-ben. */
  columnMissing: boolean;
  save: (cats: string[]) => Promise<{ ok: boolean; error?: string }>;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  userId: null,
  preferred: null,
  loading: true,
  columnMissing: false,
  save: async () => ({ ok: false }),
});

export function usePreferences() {
  return useContext(PreferencesContext);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [preferred, setPreferred] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [columnMissing, setColumnMissing] = useState(false);

  useEffect(() => {
    let active = true;

    async function load(session: { user?: { id: string } } | null) {
      if (!session?.user) {
        if (active) { setUserId(null); setPreferred(null); setLoading(false); }
        return;
      }
      if (active) setUserId(session.user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_categories')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        // Ha az oszlop még nem létezik, ne törjön el – kezeljük "nincs szűrő"-ként.
        if (error.message?.toLowerCase().includes('preferred_categories')) {
          setColumnMissing(true);
        }
        setPreferred(null);
      } else {
        const cats = (data as { preferred_categories?: string[] | null } | null)?.preferred_categories;
        setPreferred(Array.isArray(cats) && cats.length > 0 ? cats : null);
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => load(session));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  async function save(cats: string[]): Promise<{ ok: boolean; error?: string }> {
    if (!userId) return { ok: false, error: 'Nincs bejelentkezve' };
    const value = cats.length > 0 ? cats : null;
    const { error } = await (supabase.from('profiles') as any)
      .update({ preferred_categories: value })
      .eq('user_id', userId);
    if (error) {
      if (error.message?.toLowerCase().includes('preferred_categories')) {
        return { ok: false, error: 'A preferred_categories oszlop még hiányzik az adatbázisból.' };
      }
      return { ok: false, error: error.message };
    }
    setPreferred(value);
    return { ok: true };
  }

  return (
    <PreferencesContext.Provider value={{ userId, preferred, loading, columnMissing, save }}>
      {children}
    </PreferencesContext.Provider>
  );
}
