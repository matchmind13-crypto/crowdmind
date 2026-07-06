'use client';
import { useEffect, useState } from 'react';

// A választás localStorage-ban él; a villanás-mentes betöltést a
// app/layout.tsx-ben lévő inline script végzi (a hydration előtt fut).
const KEY = 'crowdmind_theme';

export function useTheme() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(!document.documentElement.classList.contains('light'));
  }, []);

  function toggle() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('light', !nextDark);
    try {
      window.localStorage.setItem(KEY, nextDark ? 'dark' : 'light');
    } catch {
      // privát mód – nem baj
    }
  }

  return { dark, toggle };
}
