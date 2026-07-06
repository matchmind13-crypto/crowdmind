// ============================================================
//  FIGYELEM – MOCK ADAT: a közösségi mini-térkép demó ország-adatai.
//  KÉSŐBB CSERÉLENDŐ valódi geo-analitikára (pl. Vercel Analytics
//  ország-bontása alapján). A Trendek / Hangulatindex / Kedvenc témáid
//  panelek már VALÓDI adatból számolnak (lib/usePosts).
// ============================================================
import type { CountryActivity } from './types';

export const communityMap: CountryActivity[] = [
  { code: '🇺🇸', name: 'USA', change: 128, x: 22, y: 42 },
  { code: '🇭🇺', name: 'Magyarország', change: 96, x: 53, y: 36 },
  { code: '🇩🇪', name: 'Németország', change: 75, x: 50, y: 33 },
  { code: '🇧🇷', name: 'Brazília', change: 62, x: 34, y: 68 },
  { code: '🇯🇵', name: 'Japán', change: 45, x: 84, y: 40 },
];
