'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { X, MessageSquarePlus, Loader2, CheckCircle2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

/**
 * Visszajelzés-küldő ablak (hibák, ötletek) — bejelentkezés nélkül is használható.
 * Portálban renderel (a Sidebar a mobil-fiókban filter-es ős alatt ülhet),
 * a /api/feedback végpontra küld, az aktuális oldal útvonalával együtt.
 */
export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (message.trim().length < 3 || sending) return;
    setSending(true);
    setError('');
    try {
      // Ha az auth-lekérés beragadna (pl. elavult token frissítése közben),
      // 3 mp után névtelenül küldjük el — a visszajelzés fontosabb, mint a névjegy.
      const session = await Promise.race([
        supabase.auth.getSession().then(({ data }) => data.session),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          page: pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Nem sikerült elküldeni — próbáld újra!');
        setSending(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Nem sikerült elküldeni — próbáld újra!');
    }
    setSending(false);
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl shadow-black/60">
        <div className="mb-1 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-strong/20 text-accent-soft ring-1 ring-accent/30">
            <MessageSquarePlus size={19} />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-fg">Visszajelzés küldése</h2>
            <p className="text-sm text-muted">Hibát találtál? Ötleted van? Minden üzenetet elolvasunk.</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="mt-5 rounded-xl border border-positive/30 bg-positive/10 p-5 text-center">
            <CheckCircle2 size={26} className="mx-auto mb-2 text-positive" />
            <p className="text-sm font-semibold text-fg">Köszönjük a visszajelzést!</p>
            <p className="mt-1 text-xs text-muted">Sokat segítesz vele, hogy a CrowdMind jobb legyen.</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
            >
              Bezárás
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Írd le, mit tapasztaltál, vagy mit szeretnél látni az oldalon…"
              className="w-full resize-none rounded-xl border border-line bg-bg-elevated p-3.5 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />

            {!user && (
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (nem kötelező — ha kérsz választ)"
                  className="w-full rounded-xl border border-line bg-bg-elevated px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            )}

            {error && <p className="text-sm text-negative">{error}</p>}

            <button
              onClick={() => void handleSend()}
              disabled={sending || message.trim().length < 3}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {sending ? 'Küldés…' : 'Visszajelzés elküldése'}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-muted">
              Az üzenettel együtt az oldal címét ({pathname}) is elmentjük, hogy tudjuk, hol jártál.
              {user ? ' Bejelentkezve küldöd, így tudunk válaszolni.' : ''}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
