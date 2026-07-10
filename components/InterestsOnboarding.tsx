'use client';
import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { CATEGORIES, MIN_INTERESTS } from '@/lib/categories';
import { trackFunnel } from '@/lib/funnel';
import { useAuth } from '@/lib/useAuth';
import { usePreferences } from './PreferencesProvider';

/**
 * Kötelező érdeklődés-választó kapu bejelentkezés/regisztráció után (Tinder-stílus):
 * amíg a felhasználónak nincs legalább MIN_INTERESTS kiválasztott témaköre,
 * teljes képernyős választó jelenik meg. A választás a profiles.preferred_categories-be
 * kerül, így azonnal a "Neked" fület is személyre szabja — később a Sidebar
 * "Egyéni hírfolyam → Szerkesztés" gombjával módosítható.
 */
export function InterestsOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const { preferred, loading, columnMissing, save } = usePreferences();
  const [selected, setSelected] = useState<string[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const show =
    !authLoading &&
    !!user?.username && // névválasztás előtt a UsernameSetupModal a dolga
    !loading &&
    !columnMissing &&
    (preferred?.length ?? 0) < MIN_INTERESTS;

  // A korábbi (5-nél kevesebb) választást előre bepipáljuk.
  useEffect(() => {
    if (show && !seeded) {
      setSelected(preferred ?? []);
      setSeeded(true);
    }
  }, [show, seeded, preferred]);

  // Amíg a kapu látszik, az alatta lévő oldal ne görögjön.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [show]);

  if (!show) return null;

  function toggle(name: string) {
    setSelected((s) => (s.includes(name) ? s.filter((c) => c !== name) : [...s, name]));
  }

  async function handleSave() {
    if (selected.length < MIN_INTERESTS || saving) return;
    setSaving(true);
    setError('');
    const res = await save(selected);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? 'Nem sikerült menteni — próbáld újra!');
      return;
    }
    trackFunnel('temakorok_kesz');
    // Sikernél a preferred frissül, és a kapu magától eltűnik.
  }

  const missing = Math.max(0, MIN_INTERESTS - selected.length);
  const ready = selected.length >= MIN_INTERESTS;

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-bg">
      {/* Finom márka-háttér */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-strong/10 via-transparent to-transparent" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent-strong/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pt-10 sm:pt-14">
        {/* Fejléc */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-strong/15 px-3 py-1 text-xs font-semibold text-accent-soft">
            <Sparkles size={13} />
            Még egy lépés, és kész a fiókod
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-fg sm:text-4xl">Mi érdekel?</h1>
          <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
            Válassz <span className="font-semibold text-fg">legalább {MIN_INTERESTS} témakört</span> —
            ezekből áll össze a saját hírfolyamod a „Neked" fülön. Később bármikor módosíthatod az
            Egyéni hírfolyam beállításánál.
          </p>
        </div>

        {/* Témakör-pill-ek */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5 pb-40">
          {CATEGORIES.map((cat) => {
            const active = selected.includes(cat.name);
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => toggle(cat.name)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'border-accent bg-accent-strong text-white shadow-lg shadow-accent-strong/30'
                    : 'border-line bg-card text-fg-soft hover:border-accent/40 hover:bg-hover'
                }`}
              >
                <Icon size={15} className={active ? 'text-white' : 'text-accent-soft'} />
                {cat.name}
                {active && <Check size={14} />}
              </button>
            );
          })}
        </div>

        {/* Rögzített alsó sáv: haladás + mentés */}
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-card/95 backdrop-blur-md">
          <div className="mx-auto w-full max-w-3xl px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className={ready ? 'font-medium text-positive' : 'text-muted'}>
                {ready
                  ? `${selected.length} témakör kiválasztva ✓`
                  : `Még ${missing} témakör hiányzik`}
              </span>
              <span className="font-semibold text-fg-soft">
                {Math.min(selected.length, MIN_INTERESTS)}/{MIN_INTERESTS}
              </span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent transition-all duration-300"
                style={{ width: `${Math.min(selected.length / MIN_INTERESTS, 1) * 100}%` }}
              />
            </div>
            {error && <p className="mb-2 text-center text-sm text-negative">{error}</p>}
            <button
              onClick={() => void handleSave()}
              disabled={!ready || saving}
              className="w-full rounded-xl bg-accent-strong py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-accent-strong/25 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Mentés…' : ready ? 'Kész, mehet a hírfolyamom!' : `Válassz még ${missing} témakört`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
