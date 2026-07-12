'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, LogIn, UserPlus, Loader2, Mail, Lock, User as UserIcon,
  ThumbsUp, BrainCircuit, Target, UsersRound, ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { trackFunnel } from '@/lib/funnel';

// A felhasználónév-mező lehetséges állapotai a valós idejű ellenőrzéshez.
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// Hova térjünk vissza sikeres belépés/regisztráció után — az AppShell menti el
// minden valódi oldalon (pl. egy megosztott poszton), hogy onnan ne vesszen el a látogató.
function getReturnPath(): string {
  try {
    const path = window.sessionStorage.getItem('cm_return_to');
    if (path && path.startsWith('/') && !path.startsWith('/login')) return path;
  } catch {
    // privát mód / sessionStorage tiltva — nem kritikus
  }
  return '/';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  // Tölcsér: hányan jutnak el a bejelentkezés/regisztráció oldalig.
  useEffect(() => {
    trackFunnel('login_oldal');
  }, []);

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
      else { window.location.href = getReturnPath(); return; }
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

    trackFunnel('regisztracio_kesz'); // keepalive: az átirányítás közben is elmegy
    window.location.href = getReturnPath();
  }

  const registerDisabled = !isLogin && usernameStatus !== 'available';

  return (
    <div className="flex min-h-screen">
      {/* BAL: márka-panel — csak nagy képernyőn */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16">
        {/* Háttér: márka-színátmenet + fény-foltok */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1a1040] via-[#0d0a1f] to-[#05070d]" />
        <div className="absolute -left-24 -top-24 -z-10 h-96 w-96 rounded-full bg-accent-strong/25 blur-3xl" />
        <div className="absolute -bottom-32 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl" />

        {/* Logó */}
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-strong to-accent text-white shadow-xl shadow-accent-strong/40">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
            </svg>
          </span>
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">CROWD</span>
            <span className="text-accent-soft">MIND</span>
          </span>
        </div>

        {/* Középső üzenet + értékek */}
        <div className="max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
            Ahol a véleményed<br />
            <span className="text-accent-soft">tényleg számít.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            Kérdezz, szavazz, vitázz — az AI pedig összegzi, mit gondol a közösség, és megmutatja
            a másik oldal legerősebb érvét is.
          </p>
          <ul className="mt-8 space-y-4">
            <ValueItem icon={ThumbsUp} title="Szavazz három gombbal">
              Mellette, semleges vagy ellene — és nézd élőben, merre billen a közösség.
            </ValueItem>
            <ValueItem icon={BrainCircuit} title="AI-elemzés + ördög ügyvédje">
              Összegzett érvek, és mindig ott a kisebbség legjobb ellenérve is.
            </ValueItem>
            <ValueItem icon={Target} title="Jóslatok és „Igazam lett”">
              Tippelj, és gyűjtsd a nem-kamuzható találatokat a profilodra.
            </ValueItem>
            <ValueItem icon={UsersRound} title="Csoportok és viták">
              Alapíts közösséget bármilyen téma köré, vagy csatlakozz máséhoz.
            </ValueItem>
          </ul>
        </div>

        {/* Lábléc */}
        <p className="flex items-center gap-2 text-sm text-white/50">
          <ShieldCheck size={15} className="text-accent-soft" />
          Ingyenes · nincs nyomkövetés · az adataid a tieid
        </p>
      </aside>

      {/* JOBB: űrlap */}
      <main className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-lg">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft">
            <ArrowLeft size={15} />
            Vissza a hírfolyamhoz
          </Link>

          {/* Mobil logó (nagy képernyőn a bal panelen van) */}
          <div className="mt-6 flex items-center gap-2.5 lg:hidden">
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

          {/* Fejléc */}
          <h1 className="mt-6 text-3xl font-extrabold text-fg">
            {isLogin ? 'Üdv újra! 👋' : 'Csatlakozz a közösséghez'}
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {isLogin
              ? 'Jelentkezz be, és folytasd ott, ahol abbahagytad.'
              : 'Egy perc az egész — email, felhasználónév, jelszó, és már szavazhatsz is.'}
          </p>

          {/* Űrlap-kártya */}
          <div className="mt-6 rounded-2xl border border-line bg-card p-6 sm:p-8">
            {/* Váltó fülek */}
            <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg-elevated p-1">
              <button
                onClick={() => { setIsLogin(true); setMessage(''); }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${isLogin ? 'bg-accent-strong text-white' : 'text-muted hover:text-fg-soft'}`}
              >
                Bejelentkezés
              </button>
              <button
                onClick={() => { setIsLogin(false); setMessage(''); trackFunnel('regisztracio_szandek'); }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${!isLogin ? 'bg-accent-strong text-white' : 'text-muted hover:text-fg-soft'}`}
              >
                Regisztráció
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Email</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="te@email.hu"
                    className="w-full rounded-xl border border-line bg-bg-elevated py-3.5 pl-11 pr-4 text-[15px] text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Felhasználónév</label>
                  <div className="relative">
                    <UserIcon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="pl. csanad23"
                      className="w-full rounded-xl border bg-bg-elevated py-3.5 pl-11 pr-4 text-[15px] text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
                      style={{
                        borderColor:
                          usernameStatus === 'available' ? 'var(--color-positive)'
                          : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? 'var(--color-negative)'
                          : 'var(--color-line)',
                      }}
                    />
                  </div>
                  <p className="mt-2 min-h-4 text-xs">
                    {usernameStatus === 'checking' && <span className="text-muted">Ellenőrzés…</span>}
                    {usernameStatus === 'available' && <span className="text-positive">✓ Szabad — ez a te neved lesz</span>}
                    {usernameStatus === 'taken' && <span className="text-negative">✗ Ez a név már foglalt</span>}
                    {usernameStatus === 'invalid' && <span className="text-negative">Legalább 3 karakter (kisbetű, szám, _)</span>}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Jelszó</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !registerDisabled) void handleSubmit(); }}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-line bg-bg-elevated py-3.5 pl-11 pr-4 text-[15px] text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <button
                onClick={() => void handleSubmit()}
                disabled={loading || registerDisabled}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-accent-strong/25 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}
                {loading ? 'Folyamatban…' : isLogin ? 'Bejelentkezés' : 'Fiók létrehozása'}
              </button>

              {isLogin && (
                <button
                  onClick={() => void handleForgotPassword()}
                  className="w-full text-center text-sm text-muted transition-colors hover:text-accent-soft"
                >
                  Elfelejtetted a jelszavad?
                </button>
              )}

              {message && <p className="text-center text-sm text-negative">{message}</p>}
              {info && <p className="text-center text-sm text-positive">{info}</p>}
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted">
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
      </main>
    </div>
  );
}

/** Érték-pont a bal oldali márka-panelen. */
function ValueItem({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ThumbsUp;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-accent-soft ring-1 ring-white/15">
        <Icon size={17} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-white/60">{children}</span>
      </span>
    </li>
  );
}
