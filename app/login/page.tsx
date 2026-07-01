'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>{isLogin ? 'Bejelentkezés' : 'Regisztráció'}</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10 }} />
      <input type="password" placeholder="Jelszó" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10 }} />
      <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
        {loading ? 'Folyamatban...' : (isLogin ? 'Bejelentkezés' : 'Regisztráció')}
      </button>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'blue', textAlign: 'center' }}>
        {isLogin ? 'Nincs még fiókod? Regisztrálj' : 'Van már fiókod? Jelentkezz be'}
      </p>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
