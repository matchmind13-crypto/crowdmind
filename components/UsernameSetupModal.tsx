'use client';
import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

/**
 * Ha a felhasználó be van jelentkezve, de még NINCS felhasználóneve (nincs profiles sora),
 * ez az ablak kéri, hogy válasszon egyet — valós idejű foglaltság-ellenőrzéssel.
 */
export function UsernameSetupModal() {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Valós idejű, debounce-olt foglaltság-ellenőrzés.
  useEffect(() => {
    if (username.length === 0) { setStatus('idle'); return; }
    if (username.length < 3) { setStatus('invalid'); return; }

    setStatus('checking');
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .maybeSingle();
      if (error) { setStatus('idle'); return; }
      setStatus(data ? 'taken' : 'available');
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  // Csak bejelentkezett, felhasználónév nélküli usernek jelenik meg.
  if (loading || !user || user.username) return null;

  function handleChange(raw: string) {
    setUsername(raw.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20));
  }

  async function handleSave() {
    if (!user || status !== 'available') return;
    setSaving(true);
    setError('');
    const { error } = await (supabase.from('profiles') as any).insert({
      user_id: user.id,
      username,
    });
    if (error) {
      if (error.code === '23505') setError('Ez a felhasználónév közben foglalt lett. Válassz másikat!');
      else setError('Nem sikerült menteni: ' + error.message);
      setSaving(false);
      return;
    }
    // Siker – frissítjük az oldalt, hogy a fejléc a nevet mutassa.
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl shadow-black/60">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-strong/20 text-accent-soft ring-1 ring-accent/30">
            <UserCircle size={22} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-fg">Válassz felhasználónevet</h2>
            <p className="text-sm text-muted">Ez a neved, amit mások látni fognak.</p>
          </div>
        </div>

        <input
          autoFocus
          value={username}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Felhasználónév"
          className="w-full rounded-xl border bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted focus:outline-none"
          style={{
            borderColor:
              status === 'available' ? 'var(--color-positive)'
              : (status === 'taken' || status === 'invalid') ? 'var(--color-negative)'
              : 'var(--color-line)',
          }}
        />

        <div className="mt-2 min-h-5 text-sm">
          {status === 'checking' && <span className="text-muted">Ellenőrzés…</span>}
          {status === 'available' && <span className="text-positive">✓ Szabad</span>}
          {status === 'taken' && <span className="text-negative">✗ Ez a név már foglalt</span>}
          {status === 'invalid' && <span className="text-negative">Legalább 3 karakter (kisbetű, szám, _)</span>}
        </div>

        {error && <p className="mt-1 text-sm text-negative">{error}</p>}

        <button
          onClick={handleSave}
          disabled={status !== 'available' || saving}
          className="mt-4 w-full rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Mentés…' : 'Felhasználónév mentése'}
        </button>
      </div>
    </div>
  );
}
