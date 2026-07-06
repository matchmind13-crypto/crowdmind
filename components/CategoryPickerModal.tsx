'use client';
import { useState } from 'react';
import { Check, X, Rss } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { usePreferences } from './PreferencesProvider';

/** Kategória-kiválasztó ablak checkbox-okkal az "Egyéni hírfolyam"-hoz. */
export function CategoryPickerModal({ onClose }: { onClose: () => void }) {
  const { preferred, save } = usePreferences();
  const [selected, setSelected] = useState<string[]>(preferred ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggle(name: string) {
    setSelected((s) => (s.includes(name) ? s.filter((c) => c !== name) : [...s, name]));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const res = await save(selected);
    setSaving(false);
    if (!res.ok) { setError(res.error ?? 'Hiba a mentéskor'); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl shadow-black/60">
        <div className="mb-1 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-strong/20 text-accent-soft ring-1 ring-accent/30">
            <Rss size={19} />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-fg">Egyéni hírfolyam</h2>
            <p className="text-sm text-muted">Válaszd ki, mely témák érdekelnek.</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-fg">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const active = selected.includes(cat.name);
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => toggle(cat.name)}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? 'border-accent/50 bg-accent-strong/15 text-fg'
                    : 'border-line bg-bg-elevated text-fg-soft hover:bg-hover'
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                    active ? 'border-accent bg-accent-strong text-white' : 'border-line'
                  }`}
                >
                  {active && <Check size={13} />}
                </span>
                <Icon size={16} className={active ? 'text-accent-soft' : 'text-muted'} />
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>{selected.length === 0 ? 'Nincs kiválasztva – minden téma látszik' : `${selected.length} kategória kiválasztva`}</span>
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="text-accent-soft hover:text-accent">
              Törlés
            </button>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-negative">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
        >
          {saving ? 'Mentés…' : 'Mentés'}
        </button>
      </div>
    </div>
  );
}
