'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackFunnel } from '@/lib/funnel';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

/** A leggyakoribb Supabase-hibaüzenetek magyarul — a ritkábbak angolul maradnak. */
function authErrorHu(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Hibás email-cím vagy jelszó.';
  if (msg.includes('Email not confirmed')) return 'Az email-címed még nincs megerősítve — nézd meg a postafiókod (a spam mappát is).';
  if (msg.includes('already registered')) return 'Ezzel az email-címmel már van fiók — lépj be a Belépés fülön.';
  if (msg.includes('rate limit') || msg.includes('Too many')) return 'Túl sok próbálkozás — várj egy-két percet, és próbáld újra.';
  if (msg.includes('at least 6 characters')) return 'A jelszó legalább 6 karakter legyen.';
  return msg;
}

/**
 * Beágyazott belépés/regisztráció — ott, ahol a látogató épp cselekedne
 * (pl. szavazna), külön oldalra dobás nélkül. Sikeres azonosítás után az
 * onSuccess fut le, és a látogató PONTOSAN ott folytatja, ahol tartott.
 * Portállal a body-ra kerül (a filter/transform-os ősök csapdája ellen).
 */
export function AuthModal({
  open,
  onClose,
  onSuccess,
  lead = 'Fél perc az egész — és a szavazatod már számít is.',
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: string;
}) {
  // Új látogatónál a regisztráció a valószínűbb szándék — az az alapfül.
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  // Nyitáskor tölcsér-jel + Esc-re zárás + háttér-görgetés tiltása.
  useEffect(() => {
    if (!open) return;
    trackFunnel('regisztracio_szandek');
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Valós idejű felhasználónév-ellenőrzés (debounce-szal), csak regisztrációnál.
  useEffect(() => {
    if (!open || isLogin) return;
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
  }, [username, isLogin, open]);

  function handleUsernameChange(raw: string) {
    setUsername(raw.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20));
  }

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);
    setMessage('');
    try {
      const cleanEmail = email.trim();

      // ---------- BEJELENTKEZÉS ----------
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) { setMessage(authErrorHu(error.message)); return; }
        onSuccess();
        return;
      }

      // ---------- REGISZTRÁCIÓ ----------
      if (username.length < 3) { setMessage('A felhasználónév legalább 3 karakter legyen.'); return; }
      if (usernameStatus === 'taken') { setMessage('Ez a felhasználónév már foglalt.'); return; }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (signUpError) { setMessage(authErrorHu(signUpError.message)); return; }

      let session = signUpData.session;
      const userId = signUpData.user?.id;
      if (!session) {
        const { data: signInData } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        session = signInData.session ?? null;
      }
      if (!session || !userId) {
        setMessage('Regisztráció sikeres! Ha megerősítő emailt kaptál, előbb erősítsd meg, aztán lépj be.');
        setIsLogin(true);
        return;
      }

      const { error: profileError } = await (supabase.from('profiles') as any)
        .insert({ user_id: userId, username });
      if (profileError) {
        if (profileError.code === '23505') setMessage('Ez a felhasználónév közben foglalt lett. Válassz másikat!');
        else setMessage('A fiók létrejött, de a felhasználónév mentése nem sikerült: ' + profileError.message);
        return;
      }

      trackFunnel('regisztracio_kesz');
      onSuccess();
    } catch {
      setMessage('Nem sikerült elérni a szervert — ellenőrizd a netkapcsolatot, és próbáld újra.');
    } finally {
      setLoading(false);
    }
  }

  const registerDisabled = !isLogin && usernameStatus !== 'available';

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl shadow-black/60">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted transition-colors hover:text-fg-soft"
          aria-label="Bezárás"
        >
          <X size={15} />
        </button>

        <h2 className="text-xl font-extrabold text-fg">
          {isLogin ? 'Üdv újra! 👋' : 'Csatlakozz egy perc alatt'}
        </h2>
        <p className="mt-1 text-sm text-muted">{lead}</p>

        {/* Váltó fülek */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg-elevated p-1">
          <button
            onClick={() => { setIsLogin(false); setMessage(''); }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${!isLogin ? 'bg-accent-strong text-white' : 'text-muted hover:text-fg-soft'}`}
          >
            Regisztráció
          </button>
          <button
            onClick={() => { setIsLogin(true); setMessage(''); }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${isLogin ? 'bg-accent-strong text-white' : 'text-muted hover:text-fg-soft'}`}
          >
            Belépés
          </button>
        </div>

        <div className="mt-5 space-y-4">
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

          {!isLogin && (
            <div>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="felhasználónév (pl. csanad23)"
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
                {usernameStatus === 'available' && <span className="text-positive">✓ Szabad — ez a te neved lesz</span>}
                {usernameStatus === 'taken' && <span className="text-negative">✗ Ez a név már foglalt</span>}
                {usernameStatus === 'invalid' && <span className="text-negative">Legalább 3 karakter (kisbetű, szám, _)</span>}
              </p>
            </div>
          )}

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !registerDisabled) void handleSubmit(); }}
              placeholder="jelszó"
              className="w-full rounded-xl border border-line bg-bg-elevated py-3 pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <button
            onClick={() => void handleSubmit()}
            disabled={loading || registerDisabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white shadow-lg shadow-accent-strong/25 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? 'Folyamatban…' : isLogin ? 'Bejelentkezés' : 'Fiók létrehozása és folytatás'}
          </button>

          {message && <p className="text-center text-sm text-negative">{message}</p>}

          {isLogin && (
            <p className="text-center text-xs text-muted">
              Elfelejtett jelszó?{' '}
              <Link href="/login" className="text-accent-soft underline">A belépés-oldalon tudod visszaállítani.</Link>
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          A regisztrációval elfogadod a{' '}
          <Link href="/szabalyzat" className="text-accent-soft underline">szabályzatot</Link> és az{' '}
          <Link href="/privacy" className="text-accent-soft underline">adatkezelést</Link>; a felhasználóneved
          nyilvánosan megjelenik a hozzászólásaid mellett.
        </p>
      </div>
    </div>,
    document.body,
  );
}
