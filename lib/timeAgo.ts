/** ISO dátum -> magyar relatív idő ("5 perce", "3 napja"). */
export function timeAgo(iso: string): string {
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'most';
  const min = sec / 60;
  if (min < 60) return `${Math.floor(min)} perce`;
  const h = min / 60;
  if (h < 24) return `${Math.floor(h)} órája`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)} napja`;
  if (d < 31) return `${Math.floor(d / 7)} hete`;
  if (d < 365) return `${Math.floor(d / 30)} hónapja`;
  return `${Math.floor(d / 365)} éve`;
}
