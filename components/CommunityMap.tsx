import { ArrowUpRight } from 'lucide-react';
import { communityMap } from '@/data/trends';
import { PanelCard, PanelHeader } from './PanelCard';
import { PanelFooter } from './TrendPanel';

export function CommunityMap() {
  return (
    <PanelCard>
      <PanelHeader title="Közösségi térkép" action="Teljes térkép" />

      {/* Stilizált pontrácsos "világtérkép" glóló lila pontokkal */}
      <div className="relative mb-3 overflow-hidden rounded-xl border border-line bg-bg-elevated">
        <svg viewBox="0 0 100 46" className="w-full">
          <defs>
            <pattern id="dots" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.35" fill="#22304d" />
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

      <PanelFooter label="Teljes térkép megnyitása" />
    </PanelCard>
  );
}
