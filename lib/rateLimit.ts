// Egyszerű memóriabeli kérés-korlátozó az AI-végpontokhoz.
// MEGJEGYZÉS: Vercel serverless környezetben példányonként él (nem globális),
// így a tényleges limit ennél lazább lehet — MVP-védelemnek elegendő,
// később cserélhető pl. Upstash/Redis alapúra.
const buckets = new Map<string, number[]>();

/** true = mehet a kérés; false = túllépte a limitet. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
