// ============================================================
//  CrowdMind – közös típusdefiníciók a mock adatokhoz
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

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type BadgeKind =
  | 'expert'        // Szakértő
  | 'experience'    // Valódi tapasztalat
  | 'trusted'       // Hiteles válaszadó
  | 'top'           // Top kommentelő
  | 'owner'         // Tulajdonos
  | 'moderator';    // Moderátor

export interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  credibility: number;   // 0–100
  badges: BadgeKind[];
  pro?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  ago: string;
  body: string;
  votes: number;
  badge?: BadgeKind;     // kiemelt jelvény a komment mellett
}

export interface AISummary {
  short: string;                 // rövid összefoglaló
  detailed: string;              // részletes összefoglaló
  sentiment: { positive: number; neutral: number; negative: number }; // %-ok, összeg 100
  themes: string[];              // fő témák
  argumentsFor: string[];        // fő érvek mellette
  keywords: string[];            // leggyakoribb kulcsszavak
  consensus: number;             // konszenzus erőssége 0–100
  updatedAgo: string;
}

/** A CrowdMind ikonikus "Közösség egy pillantásban" blokk adatai. */
export interface Snapshot {
  for: number;        // Mellette %
  against: number;    // Ellene %
  uncertain: number;  // Bizonytalan %
  votes: number;      // szavazatok száma
}

export interface Post {
  id: string;
  category: string[];   // pl. ["Film & Sorozat", "Star Wars"]
  title: string;
  type: PostType;
  authorId: string;
  ago: string;
  views: number;
  body: string[];       // bekezdések
  media: string[];      // kép URL-ek (üres = nincs média)
  commentsCount: number;
  comments: Comment[];
  ai: AISummary;
  snapshot: Snapshot;
}

export interface Trend {
  id: string;
  rank: number;
  title: string;
  shares: number;
  direction: 'up' | 'down';
  color: string; // ikon háttér gradient-hez
}

export interface CountryActivity {
  code: string;      // emoji zászló
  name: string;
  change: number;    // % növekedés
  x: number;         // térkép pozíció (0–100)
  y: number;         // térkép pozíció (0–100)
}
