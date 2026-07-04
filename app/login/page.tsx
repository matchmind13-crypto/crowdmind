'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// A felhasználónév-mező lehetséges állapotai a valós idejű ellenőrzéshez.
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  // --- Valós idejű felhasználónév-ellenőrzés (csak regisztrációs módban) ---
  // Ez a useEffect minden gépeléskor (username változáskor) újraindul.
  // Nem kérdezünk le AZONNAL minden leütésre, hanem várunk 400 ms-ot
  // (ez a "debounce"): ha közben tovább gépel, az előző időzítőt eldobjuk.
  useEffect(() => {
    if (isLogin) return;                          // bejelentkezésnél nincs ellenőrzés
    if (username.length === 0) { setUsernameStatus('idle'); return; }
    if (username.length < 3) { setUsernameStatus('invalid'); return; }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      // Megnézzük, van-e már ilyen felhasználónév a profiles táblában.
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        // Pl. ha a profiles tábla még nem létezik – ilyenkor nem blokkolunk,
        // csak nem mutatunk zöld pipát.
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus(data ? 'taken' : 'available');
    }, 400);

    // Ha a felhasználó tovább gépel (vagy elhagyja a mezőt), töröljük az időzítőt.
    return () => clearTimeout(timer);
  }, [username, isLogin]);

  // A beírt szöveget rögtön "megtisztítjuk": csak kisbetű, szám és alulvonás,
  // maximum 20 karakter. Így a mező mindig érvényes formátumot mutat.
  function handleUsernameChange(raw: string) {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    setUsername(cleaned);
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage('');

    // ---------- BEJELENTKEZÉS ----------
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
      setLoading(false);
      return;
    }

    // ---------- REGISZTRÁCIÓ ----------
    // Biztonsági dupla-ellenőrzés (a gomb amúgy is csak 'available' állapotnál aktív).
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

    // 1) Fiók létrehozása.
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setMessage(signUpError.message);
      setLoading(false);
      return;
    }

    // 2) Session megszerzése.
    //    Ha az email-megerősítés KI van kapcsolva (ez a cél), a signUp már ad sessiont,
    //    és a felhasználó azonnal be van jelentkezve.
    let session = signUpData.session;
    const userId = signUpData.user?.id;

    //    Ha valamiért nem jött session, megpróbálunk azonnal be is jelentkezni.
    if (!session) {
      const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      session = signInData.session ?? null;
    }

    // 3) Türelmes fallback: ha még mindig nincs session (mert épp be van kapcsolva
    //    az email-megerősítés), nem hibázunk – csak szólunk, hogy jelentkezzen be.
    if (!session || !userId) {
      setMessage('Regisztráció sikeres! Jelentkezz be. (Ha megerősítő emailt kaptál, előbb erősítsd meg.)');
      setIsLogin(true);
      setLoading(false);
      return;
    }

    // 4) A felhasználónév mentése a profiles táblába.
    //    Itt már be vagyunk jelentkezve, így az RLS szabály (auth.uid() = user_id) átengedi.
    const { error: profileError } = await (supabase.from('profiles') as any)
      .insert({ user_id: userId, username });

    if (profileError) {
      // 23505 = egyediségi ütközés (valaki közben elvitte a nevet).
      if (profileError.code === '23505') {
        setMessage('Ez a felhasználónév közben foglalt lett. Válassz másikat!');
      } else {
        setMessage('A fiók létrejött, de a felhasználónév mentése nem sikerült: ' + profileError.message);
      }
      setLoading(false);
      return;
    }

    // 5) Minden kész: a felhasználó be van jelentkezve, mehet a főoldalra.
    window.location.href = '/';
  }

  // A felhasználónév-állapothoz tartozó szöveg és szín.
  function renderUsernameHint() {
    switch (usernameStatus) {
      case 'checking':
        return <span style={{ color: '#888' }}>Ellenőrzés…</span>;
      case 'available':
        return <span style={{ color: '#16a34a' }}>✓ Szabad</span>;
      case 'taken':
        return <span style={{ color: '#dc2626' }}>✗ Foglalt</span>;
      case 'invalid':
        return <span style={{ color: '#dc2626' }}>Legalább 3 karakter (kisbetű, szám, _)</span>;
      default:
        return null;
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>{isLogin ? 'Bejelentkezés' : 'Regisztráció'}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10 }}
      />

      {/* A felhasználónév-mező CSAK regisztrációnál jelenik meg. */}
      {!isLogin && (
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Felhasználónév"
            value={username}
            onChange={e => handleUsernameChange(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              padding: 10,
              // A keret színe is jelzi az állapotot: zöld ha szabad, piros ha nem.
              border:
                usernameStatus === 'available' ? '2px solid #16a34a'
                : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '2px solid #dc2626'
                : '1px solid #ccc',
            }}
          />
          <div style={{ minHeight: 18, marginTop: 4, fontSize: 13 }}>
            {renderUsernameHint()}
          </div>
        </div>
      )}

      <input
        type="password"
        placeholder="Jelszó"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={handleSubmit}
        // Regisztrációnál csak akkor engedjük a gombot, ha a felhasználónév szabad.
        disabled={loading || (!isLogin && usernameStatus !== 'available')}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      >
        {loading ? 'Folyamatban…' : (isLogin ? 'Bejelentkezés' : 'Regisztráció')}
      </button>

      <p
        onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
        style={{ cursor: 'pointer', color: 'blue', textAlign: 'center' }}
      >
        {isLogin ? 'Nincs még fiókod? Regisztrálj' : 'Van már fiókod? Jelentkezz be'}
      </p>

      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
