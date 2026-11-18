import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rateLimit';
import { unsubToken } from '@/lib/notifyEmail';
import { SUPABASE_URL, SITE_URL } from '@/lib/publicConfig';

// ============================================================
//  EMAIL-VISSZAHÍVÁS — a notifications tábla insert-triggere hívja
//  (pg_net webhook, lásd supabase/email_notifications.sql).
//  Minden nem-kritikus kimenet 200-as "skipped", hogy a trigger
//  oldalán sose látsszon hibának, ami csak házirend (leiratkozás,
//  throttle, hiányzó kulcs).
// ============================================================

export async function POST(request: Request) {
  const secret = process.env.NOTIFY_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !serviceKey) {
    return NextResponse.json({ error: 'Az email-értesítés nincs beállítva.' }, { status: 503 });
  }
  if (request.headers.get('x-cm-notify-secret') !== secret) {
    return NextResponse.json({ error: 'Tiltott.' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ skipped: 'nincs-resend-kulcs' });

  const body = await request.json().catch(() => null);
  const userId = String(body?.user_id ?? '');
  const postId = Number(body?.post_id ?? 0) || null;
  const message = String(body?.message ?? '').slice(0, 500);
  if (!userId || !message) {
    return NextResponse.json({ error: 'Hiányos kérés.' }, { status: 400 });
  }

  // Fék: felhasználónként legfeljebb 3 email óránként (példányon belüli számláló —
  // a Resend napi kerete a végső védőháló).
  if (!checkRateLimit(`notifmail:${userId}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ skipped: 'throttle' });
  }

  const service = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Leiratkozás-ellenőrzés + megszólításhoz a felhasználónév.
  const { data: prof } = (await service
    .from('profiles')
    .select('username,email_notifications')
    .eq('user_id', userId)
    .maybeSingle()) as { data: { username?: string; email_notifications?: boolean } | null };
  if (prof && prof.email_notifications === false) {
    return NextResponse.json({ skipped: 'leiratkozva' });
  }

  const { data: userRes, error: userErr } = await service.auth.admin.getUserById(userId);
  const email = userRes?.user?.email;
  if (userErr || !email) return NextResponse.json({ skipped: 'nincs-email' });

  // Tárgy a tartalomból — a szöveg maga az értesítés már megírt magyar mondata.
  let subject = 'Új értesítésed van a CrowdMindon';
  if (message.includes('Igazad lett')) subject = '🎯 Igazad lett — eldőlt egy jóslatod!';
  else if (message.includes('jóslat eldőlt')) subject = 'Eldőlt egy jóslat, amire szavaztál';
  else if (message.includes('válaszolt')) subject = 'Válaszoltak a hozzászólásodra 💬';
  else if (message.includes('hozzászólt')) subject = 'Új hozzászólás egy követett témádban 💬';
  else if (message.includes('szavaz')) subject = 'Új szavazat érkezett a témádra';

  const link = postId ? `${SITE_URL}/post/${postId}` : SITE_URL;
  const unsub = `${SITE_URL}/api/email-leiratkozas?u=${encodeURIComponent(userId)}&t=${unsubToken(userId, secret)}`;
  const greeting = prof?.username ? `Szia, ${prof.username}!` : 'Szia!';

  const text =
    `${greeting}\n\n${message}\n\nMegnézem: ${link}\n\n—\n` +
    `CrowdMind · crowdmind.dev\nHa nem kérsz több email-értesítést: ${unsub}`;
  const html =
    `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px 16px;color:#1c1c28">` +
    `<p style="font-size:15px">${greeting}</p>` +
    `<p style="font-size:15px;line-height:1.6">${escapeHtml(message)}</p>` +
    `<p style="margin:24px 0"><a href="${link}" style="background:#6d4aff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600;font-size:14px">Megnézem a CrowdMindon</a></p>` +
    `<p style="font-size:12px;color:#888;border-top:1px solid #eee;padding-top:14px;margin-top:28px">` +
    `CrowdMind · <a href="${SITE_URL}" style="color:#6d4aff">crowdmind.dev</a><br>` +
    `<a href="${unsub}" style="color:#888">Leiratkozom az email-értesítésekről</a></p></div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'CrowdMind <ertesites@crowdmind.dev>',
      to: [email],
      subject,
      text,
      html,
      headers: { 'List-Unsubscribe': `<${unsub}>` },
    }),
  });
  if (!res.ok) {
    console.error('Resend-küldési hiba:', res.status, await res.text().catch(() => ''));
    return NextResponse.json({ skipped: 'kuldes-hiba' });
  }
  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
