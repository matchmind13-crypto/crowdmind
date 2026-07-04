import type { Trend, CountryActivity } from './types';

export const trends: Trend[] = [
  { id: 't1', rank: 1, title: 'Bitcoin: hova tart az árfolyam?', shares: 2800, direction: 'up', color: '#f59e0b' },
  { id: 't2', rank: 2, title: 'iPhone 16 megéri az upgrade-et?', shares: 1900, direction: 'up', color: '#60a5fa' },
  { id: 't3', rank: 3, title: 'F1: Ki nyeri a bajnokságot?', shares: 1600, direction: 'up', color: '#ef4444' },
  { id: 't4', rank: 4, title: 'Megéri most elektromos autót venni?', shares: 1400, direction: 'down', color: '#22c55e' },
  { id: 't5', rank: 5, title: 'Liverpool esélyei idén?', shares: 1200, direction: 'up', color: '#dc2626' },
];

export const communityMap: CountryActivity[] = [
  { code: '🇺🇸', name: 'USA', change: 128, x: 22, y: 42 },
  { code: '🇭🇺', name: 'Magyarország', change: 96, x: 53, y: 36 },
  { code: '🇩🇪', name: 'Németország', change: 75, x: 50, y: 33 },
  { code: '🇧🇷', name: 'Brazília', change: 62, x: 34, y: 68 },
  { code: '🇯🇵', name: 'Japán', change: 45, x: 84, y: 40 },
];

export const favoriteTopics: string[] = [
  'Star Wars',
  'Porsche 911',
  'Bitcoin',
  'Futball',
  'Technológia',
];

/** Globális hangulatindex (jobb oldali gauge). */
export const globalSentiment = { positive: 65, neutral: 20, negative: 15 };
