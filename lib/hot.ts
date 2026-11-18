/**
 * Reddit-stílusú "hot" rangsor: az aktivitás ereje logaritmikusan számít
 * (a 10. szavazat többet ér, mint a 100.), és idővel lecseng, hogy az új,
 * épp pörgő téma megelőzhesse a régi nagyokat. A kommentek duplán számítanak,
 * mert egy hozzászólás több munka, mint egy kattintás.
 */
export function hotScore(
  p: {
    yesVotes: number;
    noVotes: number;
    neutralVotes: number;
    commentsCount: number;
    createdAt: string;
  },
  now: number = Date.now(),
): number {
  const activity = p.yesVotes + p.noVotes + p.neutralVotes + p.commentsCount * 2;
  const order = Math.log10(Math.max(activity, 1));
  const ageHours = Math.max(0, (now - new Date(p.createdAt).getTime()) / 3_600_000);
  return order - ageHours / 48;
}
