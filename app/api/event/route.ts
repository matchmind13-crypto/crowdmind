import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rateLimit';
import { SUPABASE_URL } from '@/lib/publicConfig';

// ============================================================
//  TÖLCSÉR-ESEMÉNY – POST { name }
//  Névtelen számláló: se user_id, se süti, se IP nem kerül tárolásra.
//  (Az IP-t csak a memóriabeli sebesség-korláthoz nézzük meg.)
// ============================================================

const ALLOWED = new Set([
  'latogatas',
  'login_oldal',
  'regisztracio_szandek',
  'regisztracio_kesz',
  'temakorok_kesz',
  'szavazat',
]);

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ ok: true, skipped: true });

  const ip = (request.headers.get('x-forwarded-for') ?? 'ismeretlen').split(',')[0].trim();
  if (!checkRateLimit(`event:${ip}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? '');
  if (!ALLOWED.has(name)) {
    return NextResponse.json({ error: 'Ismeretlen esemény.' }, { status: 400 });
  }

  const service = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await (service.from('events') as any).insert({ name });
  if (error) {
    // Tábla még nincs — a mérés csendben kimarad, az oldal működik.
    return NextResponse.json({ ok: true, skipped: true });
  }
  return NextResponse.json({ ok: true });
}
