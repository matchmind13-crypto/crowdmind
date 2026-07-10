'use client';
import { useState } from 'react';
import { Check, X, Rss } from 'lucide-react';
import { CATEGORIES, MIN_INTERESTS } from '@/lib/categories';
import { usePreferences } from './PreferencesProvider';

/**
 * Az "Egyéni hírfolyam" szerkesztője: ugyanaz az 50 témakör, ugyanolyan
 * Tinder-stílusú ikonos pill-ekkel, mint a bejelentkezés utáni választóban.
 * Minimum MIN_INTERESTS témakört kell kiválasztva hagyni.
 */
export function CategoryPickerModal({ onClose }: { onClose: () => void }) {
  const { preferred, save } = usePreferences();
  const [selected, setSelected] = useState<string[]>(preferred ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggle(name: string) {
    setSelected((s) => (s.includes(name) ? s.filter((c) => c !== name) : [...s, name]));
  }

  async function handleSave() {
    if (selected.length < MIN_INTERESTS) return;
    setSaving(true);
    setError('');
    const res = await save(selected);
    setSaving(false);
    if (!res.ok) { setError(res.error ?? 'Hiba a mentéskor'); return; }
    onClose();
  }

  const missing = MIN_INTERESTS - selected.length;
  const ready = selected.length >= MIN_INTERESTS;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-2xl border border-line bg-card p-6 shadow-2xl shadow-black/60">
        <div className="mb-1 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-strong/20 text-accent-soft ring-1 ring-accent/30">
            <Rss size={19} />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-fg">Egyéni hírfolyam</h2>
            <p className="text-sm text-muted">
              Mind az {CATEGORIES.length} témakörből választhatsz — legalább {MIN_INTERESTS} maradjon
              kiválasztva. Ezek kerülnek előre a „Neked" fülön.
            </p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-fg">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {CATEGORIES.map((cat) => {
            const active = selected.includes(cat.name);
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => toggle(cat.name)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'border-accent bg-accent-strong text-white shadow-md shadow-accent-strong/25'
                    : 'border-line bg-bg-elevated text-fg-soft hover:border-accent/40 hover:bg-hover'
                }`}
              >
                <Icon size={14} className={active ? 'text-white' : 'text-accent-soft'} />
                {cat.name}
                {active && <Check size={13} />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className={ready ? 'font-medium text-positive' : 'text-muted'}>
            {ready
              ? `${selected.length} témakör kiválasztva ✓`
              : `Még ${missing} témakör hiányzik (minimum ${MIN_INTERESTS})`}
          </span>
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="text-accent-soft hover:text-accent">
              Törlés
            </button>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-negative">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !ready}
          className="mt-3 w-full rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Mentés…' : !ready ? `Válassz még ${missing} témakört` : 'Mentés'}
        </button>
      </div>
    </div>
  );
}
