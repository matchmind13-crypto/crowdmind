'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/** A bejelentkezett felhasználó olvasatlan értesítéseinek száma (badge-ekhez). */
export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) return;
      const { count: c, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('read', false);
      if (active && !error && typeof c === 'number') setCount(c);
    });
    return () => { active = false; };
  }, []);

  return count;
}
