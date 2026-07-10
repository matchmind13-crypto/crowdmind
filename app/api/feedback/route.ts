import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserIdFromRequest } from '@/lib/serverAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { SUPABASE_URL } from '@/lib/publicConfig';

// ============================================================
//  VISSZAJELZÉS – POST { message, email?, page? }
//  Bejelentkezés NÉLKÜL is küldhető (a korai látogatók hangja arany).
//  A tábla RLS-e zárt: csak ez a végpont ír bele (service-kulccsal),
//  IP/fiók szerinti sebesség-korláttal.
// ============================================================

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'A visszajelzés-küldés beállítás alatt áll.' }, { status: 503 });
  }

  const ip = (request.headers.get('x-forwarded-for') ?? 'ismeretlen').split(',')[0].trim();
  const userId = await getUserIdFromRequest(request); // névtelenül is mehet → null
  if (!checkRateLimit(`feedback:${userId ?? ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Túl sok visszajelzést küldtél rövid idő alatt. Próbáld pár perc múlva!' },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const message = String(body?.message ?? '').trim().slice(0, 2000);
  if (message.length < 3) {
    return NextResponse.json({ error: 'Írj legalább pár szót!' }, { status: 400 });
  }
  const email = String(body?.email ?? '').trim().slice(0, 200) || null;
  const page = String(body?.page ?? '').trim().slice(0, 200) || null;

  const service = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await (service.from('feedback') as any).insert({
    user_id: userId,
    email,
    message,
    page,
  });
  if (error) {
    if (/relation|schema cache/i.test(error.message)) {
      return NextResponse.json({ error: 'A visszajelzés funkció hamarosan elérhető.' }, { status: 503 });
    }
    console.error('Visszajelzés mentési hiba:', error.message);
    return NextResponse.json({ error: 'Nem sikerült menteni. Próbáld újra!' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
