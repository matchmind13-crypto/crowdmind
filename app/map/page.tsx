'use client';
import { Map as MapIcon, ArrowUpRight, Hash, Users, Globe2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';

// ============================================================
//  FIGYELEM – MOCK ADATOK: a földrajzi aktivitás demó-adat.
//  Jelenleg nem gyűjtünk ország-szintű látogatottsági adatot;
//  KÉSŐBB CSERÉLENDŐ valódi analitikára (pl. Vercel Analytics
//  ország-bontása vagy saját geo-naplózás alapján).
// ============================================================
const COUNTRIES = [
  { flag: '🇺🇸', name: 'USA', change: 128, x: 22, y: 42, topics: ['Technológia', 'Pénzügy'], users: 1240 },
  { flag: '🇭🇺', name: 'Magyarország', change: 96, x: 53, y: 36, topics: ['Futball', 'Lakhatás', 'Politika'], users: 2180 },
  { flag: '🇩🇪', name: 'Németország', change: 75, x: 50, y: 33, topics: ['Autók', 'Technológia'], users: 860 },
  { flag: '🇬🇧', name: 'Egyesült Királyság', change: 68, x: 46, y: 31, topics: ['Futball', 'Pénzügy'], users: 540 },
  { flag: '🇧🇷', name: 'Brazília', change: 62, x: 34, y: 68, topics: ['Futball', 'Utazás'], users: 410 },
  { flag: '🇯🇵', name: 'Japán', change: 45, x: 84, y: 40, topics: ['Technológia', 'Autók'], users: 320 },
];

/**
 * Közösségi térkép – a sidebar mini-térkép teljes, részletes verziója.
 * Egyelőre demó-adatokkal (lásd a fenti kommentet), de a dizájn végleges.
 */
export default function MapPage() {
  const totalUsers = COUNTRIES.reduce((s, c) => s + c.users, 0);

  return (
    <AppShell wide>
      <PageHeader
        icon={MapIcon}
        title="Közösségi térkép"
        subtitle="Honnan aktív a CrowdMind közössége, és mely témák pörögnek az egyes országokban"
        action={
          <span className="shrink-0 rounded-md bg-neutral/15 px-2 py-1 text-[10px] font-semibold uppercase text-neutral">
            Demó adat
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Globe2} value={COUNTRIES.length} label="Aktív ország" />
        <StatCard icon={Users} value={totalUsers.toLocaleString('hu-HU')} label="Közösségi tag (demó)" />
        <StatCard icon={ArrowUpRight} value={`+${Math.max(...COUNTRIES.map((c) => c.change))}%`} label="Leggyorsabb növekedés" />
        <StatCard icon={Hash} value="Futball" label="Leggyakoribb téma" />
      </div>

      {/* Nagy pontrácsos térkép */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <svg viewBox="0 0 100 50" className="w-full">
          <defs>
            <pattern id="bigdots" width="1.6" height="1.6" patternUnits="userSpaceOnUse">
              <circle cx="0.4" cy="0.4" r="0.28" fill="var(--color-line)" />
            </pattern>
            <radialGradient id="bigglow">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100" height="50" fill="url(#bigdots)" />
          {COUNTRIES.map((c) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r={2 + c.change / 40} fill="url(#bigglow)" />
              <circle cx={c.x} cy={c.y} r="0.9" fill="var(--color-accent-soft)" />
              <text x={c.x} y={c.y - 3.2} textAnchor="middle" fontSize="2.2" fill="var(--color-fg-soft)" fontWeight="600">
                {c.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Ország-kártyák részletekkel */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COUNTRIES.map((c) => (
          <div key={c.name} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.flag}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">{c.name}</p>
                <p className="text-xs text-muted">{c.users.toLocaleString('hu-HU')} tag</p>
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-positive/10 px-2 py-1 text-xs font-semibold text-positive">
                +{c.change}%
                <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">Népszerű témák itt</p>
              <div className="flex flex-wrap gap-1.5">
                {c.topics.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full border border-line bg-card-2 px-2 py-0.5 text-xs text-fg-soft">
                    <Hash size={10} className="text-accent-soft" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
