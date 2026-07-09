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
  | 'appreciation'  // Elismerés / értékelés
  | 'prediction';   // Jóslat – lezárási dátummal és eredménnyel

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
  /** Semleges szavazatok száma (szürkén jelenik meg a sávon). */
  neutralVotes: number;
  /** A szerző profilképe (null = anonim alap-ikon). */
  authorAvatar: string | null;
  /** Jóslatnál: mikor zárul le a szavazás (ISO); egyébként null. */
  resolveAt: string | null;
  /** Jóslatnál: a rögzített eredmény ('yes'/'no'); amíg nincs eldöntve, null. */
  outcome: 'yes' | 'no' | null;
}

/** Adatbázisból betöltött hozzászólás. */
export interface FeedComment {
  id: number;
  userId: string | null;
  username: string;
  ago: string;
  body: string;
  /** Lájkok száma a comment_likes táblából (0, amíg a tábla nem létezik). */
  likes: number;
  /** Dislike-ok száma (0, amíg a vote oszlop nem létezik). */
  dislikes: number;
  /** A bejelentkezett felhasználó szavazata: 1 = lájk, -1 = dislike, 0 = nincs. */
  myVote: 1 | -1 | 0;
  /** Szülő-hozzászólás azonosítója, ha ez egy válasz (null = fő hozzászólás). */
  parentId: number | null;
  /** A hozzászóló profilképe (null = anonim alap-ikon). */
  avatarUrl: string | null;
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

export interface CountryActivity {
  code: string;
  name: string;
  change: number;
  x: number;
  y: number;
}
