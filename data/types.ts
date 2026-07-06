// ============================================================
//  CrowdMind – közös típusdefiníciók
// ============================================================

export type PostType =
  | 'question'      // Kérdés
  | 'debate'        // Vita
  | 'opinion'       // Vélemény
  | 'experience'    // Tapasztalat
  | 'comparison'    // Összehasonlítás
  | 'poll'          // Szavazás
  | 'media'         // Média poszt
  | 'appreciation'; // Elismerés / értékelés

/** Adatbázisból betöltött poszt, a feedben megjelenítendő formában. */
export interface FeedPost {
  id: number;
  category: string[];   // pl. ["Autók", "Porsche"] – fő kategória + opcionális altéma
  title: string;
  type: PostType;
  authorId: string | null;
  authorName: string;
  ago: string;          // relatív idő, pl. "5 órája"
  createdAt: string;    // ISO – csoportosításhoz (pl. Friss oldal)
  views: number;
  body: string[];       // bekezdések
  media: string[];      // kép URL-ek
  commentsCount: number;
  yesVotes: number;
  noVotes: number;
}

/** Adatbázisból betöltött hozzászólás. */
export interface FeedComment {
  id: number;
  username: string;
  ago: string;
  body: string;
}

/** Valódi értesítés a notifications táblából. */
export interface NotificationItem {
  id: number;
  message: string;
  ago: string;
  read: boolean;
  postId: number | null;
}

/** AI-összefoglaló (egyelőre csak akkor, ha van elég hozzászólás). */
export interface AISummary {
  short: string;
  detailed: string;
  sentiment: { positive: number; neutral: number; negative: number };
  themes: string[];
  argumentsFor: string[];
  keywords: string[];
  consensus: number;
  updatedAgo: string;
}

export interface Trend {
  id: string;
  rank: number;
  title: string;
  shares: number;
  direction: 'up' | 'down';
  color: string;
}

export interface CountryActivity {
  code: string;
  name: string;
  change: number;
  x: number;
  y: number;
}
