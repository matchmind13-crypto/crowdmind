import { ArrowUpRight } from 'lucide-react';
import { communityMap } from '@/data/trends';
import { PanelCard, PanelHeader, PanelFooterLink } from './PanelCard';

/**
 * Közösségi térkép mini-panel.
 * FIGYELEM: az ország-adatok DEMÓ adatok (lásd data/trends.ts) —
 * valódi geo-analitika bekötéséig címkével jelöljük.
 */
export function CommunityMap() {
  return (
    <PanelCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-fg">Közösségi térkép</h3>
        <span className="rounded-md bg-neutral/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-neutral">Demó</span>
      </div>

      {/* Stilizált pontrácsos "világtérkép" lila pontokkal */}
      <div className="relative mb-3 overflow-hidden rounded-xl border border-line bg-bg-elevated">
        <svg viewBox="0 0 100 46" className="w-full">
          <defs>
            <pattern id="dots" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.35" fill="var(--color-line)" />
            </pattern>
            <radialGradient id="glow">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100" height="46" fill="url(#dots)" />
          {communityMap.map((c) => (
            <g key={c.code}>
              <circle cx={c.x} cy={c.y} r="3.2" fill="url(#glow)" />
              <circle cx={c.x} cy={c.y} r="1" fill="var(--color-accent-soft)" />
            </g>
          ))}
        </svg>
      </div>

      {/* Országlista */}
      <div className="space-y-0.5">
        {communityMap.map((c) => (
          <div key={c.code} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="text-base">{c.code}</span>
            <span className="flex-1 text-sm text-fg-soft">{c.name}</span>
            <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-positive">
              +{c.change}%
              <ArrowUpRight size={14} />
            </span>
          </div>
        ))}
      </div>

      <PanelFooterLink label="Teljes térkép megnyitása" href="/map" />
    </PanelCard>
  );
}
