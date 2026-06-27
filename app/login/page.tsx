'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Ellenőrizd az emailed a megerősítő linkért!');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h1>{isLogin ? 'Bejelentkezés' : 'Regisztráció'}</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <input type="password" placeholder="Jelszó" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <button onClick={handleSubmit} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
        {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
      </button>
      <button onClick={() => setIsLogin(!isLogin)} style={{ width: '100%', padding: 10 }}>
        {isLogin ? 'Még nincs fiókom' : 'Már van fiókom'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}