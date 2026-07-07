'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Loader2, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * Jelszó-visszaállítás. A levélben kapott link ide hozza a felhasználót:
 * a Supabase egy ideiglenes ("recovery") munkamenettel lépteti be, és itt
 * adhat meg új jelszót. Ha valaki link nélkül téved ide, jelezzük neki.
 */
export default function ResetPasswordPage() {
  const [ready, setReady] = useState<'checking' | 'ok' | 'no-session'>('checking');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // A recovery-link feldolgozása után lesz session; kis türelemmel várjuk be.
    let active = true;
    const t = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (active) setReady(session ? 'ok' : 'no-session');
    }, 800);
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (active && session) setReady('ok');
    });
    return () => { active = false; clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  async function handleSave() {
    setError('');
    if (password.length < 8) { setError('A jelszó legalább 8 karakter legyen.'); return; }
    if (password !== password2) { setError('A két jelszó nem egyezik.'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setSaving(false); return; }
    setDone(true);
    setTimeout(() => { window.location.href = '/'; }, 2000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-strong/20 text-accent-soft ring-1 ring-accent/30">
            <KeyRound size={20} />
          </span>
          <div>
            <h1 className="text-lg font-bold text-fg">Új jelszó beállítása</h1>
            <p className="text-sm text-muted">CrowdMind fiókodhoz</p>
          </div>
        </div>

        {ready === 'checking' && (
          <p className="flex items-center gap-2 py-4 text-sm text-muted">
            <Loader2 size={15} className="animate-spin" /> Hitelesítés ellenőrzése…
          </p>
        )}

        {ready === 'no-session' && (
          <div className="py-2">
            <p className="text-sm leading-relaxed text-fg-soft">
              Ez az oldal a jelszó-visszaállító emailben kapott linkről érhető el. Ha új linket
              szeretnél, kérj egyet a bejelentkezés oldalon.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
            >
              <ArrowLeft size={15} />
              Bejelentkezés oldal
            </Link>
          </div>
        )}

        {ready === 'ok' && !done && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Új jelszó</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Legalább 8 karakter"
                className="w-full rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Új jelszó még egyszer</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSave(); }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Mentés…' : 'Jelszó mentése'}
            </button>
            {error && <p className="text-center text-sm text-negative">{error}</p>}
          </div>
        )}

        {done && (
          <p className="flex items-center gap-2 py-4 text-sm text-positive">
            <Check size={16} /> Jelszó frissítve! Átirányítunk a főoldalra…
          </p>
        )}
      </div>
    </div>
  );
}
