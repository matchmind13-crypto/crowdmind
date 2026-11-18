import { createClient } from '@supabase/supabase-js';
import { tokenValid } from '@/lib/notifyEmail';
import { SUPABASE_URL } from '@/lib/publicConfig';

// ============================================================
//  EGY KATTINTÁSOS LEIRATKOZÁS az email-értesítésekről.
//  A levélben kapott aláírt link hívja — böngészőben nyílik,
//  ezért kis HTML-oldalt adunk vissza, nem JSON-t.
// ============================================================

function htmlPage(message: string, status = 200): Response {
  const body =
    `<!doctype html><html lang="hu"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="robots" content="noindex"><title>CrowdMind</title></head>` +
    `<body style="font-family:system-ui,-apple-system,sans-serif;background:#0d0a1f;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px">` +
    `<div style="max-width:420px;text-align:center"><p style="font-size:17px;line-height:1.6">${message}</p>` +
    `<p style="margin-top:24px"><a href="https://crowdmind.dev" style="color:#b9a5ff">← Vissza a CrowdMindra</a></p></div></body></html>`;
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('u') ?? '';
  const token = url.searchParams.get('t') ?? '';
  const secret = process.env.NOTIFY_WEBHOOK_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !serviceKey) {
    return htmlPage('A leiratkozás most nem elérhető — próbáld meg később.', 503);
  }
  if (!userId || !token || !tokenValid(userId, token, secret)) {
    return htmlPage('Érvénytelen leiratkozó-link. Ha emailből nyitottad meg, próbáld a teljes linket másolni.', 400);
  }

  const service = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await (service.from('profiles') as any)
    .update({ email_notifications: false })
    .eq('user_id', userId);
  if (error) {
    return htmlPage('A leiratkozás most nem sikerült — próbáld újra később.', 500);
  }
  return htmlPage('Kész — nem küldünk több email-értesítést. ✉️✖️<br>A profilodon bármikor visszakapcsolhatod.');
}
