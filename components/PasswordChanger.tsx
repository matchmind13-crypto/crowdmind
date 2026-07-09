'use client';
import { useState } from 'react';
import { Lock, Check, X, Loader2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Jelszó módosítása a profilról — bejelentkezett munkamenettel,
 * a supabase.auth.updateUser hívással (nem kell hozzá email-kör).
 */
export function PasswordChanger() {
  const [editing, setEditing] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const tooShort = pw1.length > 0 && pw1.length < 8;
  const mismatch = pw2.length > 0 && pw1 !== pw2;
  const canSave = pw1.length >= 8 && pw1 === pw2 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) {
      setMsg({
        text: /same|different/i.test(error.message)
          ? 'Az új jelszó nem egyezhet a régivel.'
          : 'A módosítás nem sikerült — próbáld újra.',
        ok: false,
      });
      setSaving(false);
      return;
    }
    setPw1('');
    setPw2('');
    setEditing(false);
    setMsg({ text: 'Jelszó módosítva. ✓', ok: true });
    setSaving(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Jelszó</p>
          <p className="text-base font-semibold text-fg">••••••••</p>
          {msg && <p className={`mt-1 text-xs ${msg.ok ? 'text-positive' : 'text-negative'}`}>{msg.text}</p>}
        </div>
        <button
          onClick={() => { setEditing(true); setMsg(null); }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card-2 px-3.5 py-2 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
        >
          <Pencil size={14} className="text-accent-soft" />
          Módosítás
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Új jelszó</p>
      <div className="space-y-2">
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            type="password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            placeholder="Új jelszó (legalább 8 karakter)"
            className="w-full rounded-xl border border-line bg-bg-elevated py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void save(); }}
              placeholder="Új jelszó még egyszer"
              className="w-full rounded-xl border border-line bg-bg-elevated py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <button
            onClick={() => void save()}
            disabled={!canSave}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-strong text-white transition-colors hover:bg-accent disabled:opacity-50"
            aria-label="Jelszó mentése"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button
            onClick={() => { setEditing(false); setPw1(''); setPw2(''); setMsg(null); }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-card-2 text-muted transition-colors hover:bg-hover"
            aria-label="Mégse"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <p className="mt-1.5 min-h-4 text-xs">
        {tooShort && <span className="text-negative">Legalább 8 karakter legyen.</span>}
        {!tooShort && mismatch && <span className="text-negative">A két jelszó nem egyezik.</span>}
        {!tooShort && !mismatch && pw1.length >= 8 && pw1 === pw2 && <span className="text-positive">✓ Mentheted</span>}
        {msg && !msg.ok && <span className="text-negative"> {msg.text}</span>}
      </p>
    </div>
  );
}
