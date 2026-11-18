import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Aláírt leiratkozó-token az email-értesítésekhez: a linket csak mi tudjuk
 * kiállítani (a NOTIFY_WEBHOOK_SECRET-tel), így a leiratkozó végpont nem
 * használható mások leiratkoztatására.
 */
export function unsubToken(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(`leiratkozas:${userId}`).digest('hex');
}

/** Időzítés-biztos token-összevetés (a hosszkülönbség önmagában bukás). */
export function tokenValid(userId: string, token: string, secret: string): boolean {
  const expected = Buffer.from(unsubToken(userId, secret));
  const got = Buffer.from(token);
  return expected.length === got.length && timingSafeEqual(expected, got);
}
