'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogIn, UserPlus, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// A felhasználónév-mező lehetséges állapotai a valós idejű ellenőrzéshez.
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  // Jelszó-visszaállító email küldése (a linkje a /reset-password oldalra hoz vissza).
  async function handleForgotPassword() {
    setMessage('');
    setInfo('');
    if (!email.trim()) {
      setMessage('Írd be az email címed, és utána kattints az „Elfelejtetted a jelszavad?" linkre.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setMessage(error.message);
    else setInfo('Elküldtük a jelszó-visszaállító emailt. Nézd meg a postafiókod (a spam mappát is)!');
  }

  // Valós idejű felhasználónév-ellenőrzés (debounce-szal), csak regisztrációnál.
  useEffect(() => {
    if (isLogin) return;
    if (username.length === 0) { setUsernameStatus('idle'); return; }
    if (username.length < 3) { setUsernameStatus('invalid'); return; }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .maybeSingle();
      if (error) { setUsernameStatus('idle'); return; }
      setUsernameStatus(data ? 'taken' : 'available');
    }, 400);
    return () => clearTimeout(timer);
  }, [username, isLogin]);

  function handleUsernameChange(raw: string) {
    setUsername(raw.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20));
  }

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);
    setMessage('');

    // ---------- BEJELENTKEZÉS ----------
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else { window.location.href = '/'; return; }
      setLoading(false);
      return;
    }

    // ---------- REGISZTRÁCIÓ ----------
    if (username.length < 3) {
      setMessage('A felhasználónév legalább 3 karakter legyen.');
      setLoading(false);
      return;
    }
    if (usernameStatus === 'taken') {
      setMessage('Ez a felhasználónév már foglalt.');
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setMessage(signUpError.message);
      setLoading(false);
      return;
    }

    let session = signUpData.session;
    const userId = signUpData.user?.id;
    if (!session) {
      const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      session = signInData.session ?? null;
    }
    if (!session || !userId) {
      setMessage('Regisztráció sikeres! Jelentkezz be. (Ha megerősítő emailt kaptál, előbb erősítsd meg.)');
      setIsLogin(true);
      setLoading(false);
      return;
    }

    const { error: profileError } = await (supabase.from('profiles') as any)
      .insert({ user_id: userId, username });
    if (profileError) {
      if (profileError.code === '23505') setMessage('Ez a felhasználónév közben foglalt lett. Válassz másikat!');
      else setMessage('A fiók létrejött, de a felhasználónév mentése nem sikerült: ' + profileError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  }

  const registerDisabled = !isLogin && usernameStatus !== 'available';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft">
        <ArrowLeft size={15} />
        Vissza a hírfolyamhoz
      </Link>

      {/* Logó */}
      <div className="mb-6 flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-strong to-accent text-white shadow-lg shadow-accent-strong/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
          </svg>
        </span>
        <span className="text-2xl font-extrabold tracking-tight">
          <span className="text-fg">CROWD</span>
          <span className="text-accent">MIND</span>
        </span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 sm:p-8">
        {/* Váltó fülek */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg-elevated p-1">
          <button
            onClick={() => { setIsLogin(true); setMessage(''); }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${isLogin ? 'bg-accent-strong text-white' : 'text-muted hover:text-fg-soft'}`}
          >
            Bejelentkezés
          </button>
          <button
            onClick={() => { setIsLogin(false); setMessage(''); }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${!isLogin ? 'bg-accent-strong text-white' : 'text-muted hover:text-fg-soft'}`}
          >
            Regisztráció
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="te@email.hu"
                className="w-full rounded-xl border border-line bg-bg-elevated py-3 pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Felhasználónév</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="pl. csanad23"
                  className="w-full rounded-xl border bg-bg-elevated py-3 pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
                  style={{
                    borderColor:
                      usernameStatus === 'available' ? 'var(--color-positive)'
                      : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? 'var(--color-negative)'
                      : 'var(--color-line)',
                  }}
                />
              </div>
              <p className="mt-1.5 min-h-4 text-xs">
                {usernameStatus === 'checking' && <span className="text-muted">Ellenőrzés…</span>}
                {usernameStatus === 'available' && <span className="text-positive">✓ Szabad</span>}
                {usernameStatus === 'taken' && <span className="text-negative">✗ Ez a név már foglalt</span>}
                {usernameStatus === 'invalid' && <span className="text-negative">Legalább 3 karakter (kisbetű, szám, _)</span>}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Jelszó</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !registerDisabled) void handleSubmit(); }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-bg-elevated py-3 pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <button
            onClick={() => void handleSubmit()}
            disabled={loading || registerDisabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? 'Folyamatban…' : isLogin ? 'Bejelentkezés' : 'Fiók létrehozása'}
          </button>

          {isLogin && (
            <button
              onClick={() => void handleForgotPassword()}
              className="w-full text-center text-xs text-muted transition-colors hover:text-accent-soft"
            >
              Elfelejtetted a jelszavad?
            </button>
          )}

          {message && <p className="text-center text-sm text-negative">{message}</p>}
          {info && <p className="text-center text-sm text-positive">{info}</p>}
        </div>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs leading-relaxed text-muted">
        A regisztrációval elfogadod, hogy a felhasználóneved nyilvánosan megjelenik a
        hozzászólásaid és témáid mellett, valamint a{' '}
        <Link href="/szabalyzat" className="text-accent-soft underline">
          felhasználási szabályzatot
        </Link>{' '}
        és az{' '}
        <Link href="/privacy" className="text-accent-soft underline">
          adatkezelési tájékoztatót
        </Link>
        .
      </p>
    </div>
  );
}
