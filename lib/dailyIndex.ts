import { sbRest } from './publicConfig';

/**
 * Napi közhangulat-index — szerver-oldali számítás a megosztható /ma oldalhoz
 * és az OG-képéhez. Minden szám valódi: a posts alap-számlálói + a votes tábla
 * időbélyeges sorai adják.
 */
export interface DailyIndex {
  /** A közösség pozitív (mellette) aránya összesítve, 0–100. */
  pct: number;
  totalVotes: number;
  /** Változás a tegnapi kumulatív állapothoz képest, pontban (null = nincs elég adat). */
  delta: number | null;
  topDivisive: { id: number; title: string; pct: number; total: number } | null;
  topActive: { id: number; title: string; total: number } | null;
  /** A mai nap magyar formátumban, Budapest szerint. */
  day: string;
}

interface PostRow {
  id: number;
  title: string;
  yes_votes: number | null;
  no_votes: number | null;
}

export async function fetchDailyIndex(): Promise<DailyIndex> {
  const [posts, votes] = await Promise.all([
    sbRest<PostRow[]>('posts?select=id,title,yes_votes,no_votes&limit=1000'),
    sbRest<{ vote: string; post_id: number; created_at: string }[]>(
      'votes?select=vote,post_id,created_at&order=created_at.asc&limit=5000',
    ),
  ]);

  // Poszt-szintű összesítés: alap-számlálók + valódi szavazat-sorok
  const perPost = new Map<number, { title: string; yes: number; no: number }>();
  (posts ?? []).forEach((p) => {
    perPost.set(p.id, { title: p.title, yes: p.yes_votes ?? 0, no: p.no_votes ?? 0 });
  });
  const voteRows = (votes ?? []).filter((v) => v.vote === 'yes' || v.vote === 'no');
  voteRows.forEach((v) => {
    const e = perPost.get(v.post_id);
    if (!e) return;
    if (v.vote === 'yes') e.yes += 1;
    else e.no += 1;
  });

  let yes = 0;
  let no = 0;
  perPost.forEach((e) => { yes += e.yes; no += e.no; });
  const totalVotes = yes + no;
  const pct = totalVotes > 0 ? Math.round((yes / totalVotes) * 100) : 50;

  // Delta: a valódi (időbélyeges) szavazatok kumulatív aránya ma vs tegnap végén.
  // Csak akkor mondunk számot, ha tegnapig már volt legalább 5 időbélyeges szavazat.
  const budapestDay = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Budapest' }).format(d);
  const today = budapestDay(new Date());
  let cy = 0; let cn = 0; let yYes = 0; let yNo = 0;
  voteRows.forEach((v) => {
    if (v.vote === 'yes') cy += 1; else cn += 1;
    if (budapestDay(new Date(v.created_at)) < today) { yYes = cy; yNo = cn; }
  });
  let delta: number | null = null;
  if (yYes + yNo >= 5 && cy + cn > yYes + yNo) {
    const nowPct = Math.round((cy / (cy + cn)) * 100);
    const yesterdayPct = Math.round((yYes / (yYes + yNo)) * 100);
    delta = nowPct - yesterdayPct;
  }

  // Legmegosztóbb: 50%-hoz legközelebbi arány — de az érdemi (10+ szavazatos) témák
  // elsőbbséget élveznek, hogy ne egy 2 szavazatos 50-50 vigye el a címet.
  // Legaktívabb: legtöbb összes szavazat.
  let topDivisive: DailyIndex['topDivisive'] = null;
  let topActive: DailyIndex['topActive'] = null;
  const better = (
    cand: { pct: number; total: number },
    cur: { pct: number; total: number } | null,
  ) => {
    if (!cur) return true;
    const candMeaningful = cand.total >= 10;
    const curMeaningful = cur.total >= 10;
    if (candMeaningful !== curMeaningful) return candMeaningful;
    const dc = Math.abs(cand.pct - 50);
    const du = Math.abs(cur.pct - 50);
    return dc < du || (dc === du && cand.total > cur.total);
  };
  perPost.forEach((e, id) => {
    const total = e.yes + e.no;
    if (total < 2) return;
    const p = Math.round((e.yes / total) * 100);
    if (better({ pct: p, total }, topDivisive)) {
      topDivisive = { id, title: e.title, pct: p, total };
    }
    if (!topActive || total > topActive.total) {
      topActive = { id, title: e.title, total };
    }
  });

  const day = new Intl.DateTimeFormat('hu-HU', {
    timeZone: 'Europe/Budapest',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return { pct, totalVotes, delta, topDivisive, topActive, day };
}
