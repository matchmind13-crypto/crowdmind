'use client';
import { Sprout, Sparkles, Award } from 'lucide-react';
import { tierFor } from '@/lib/credibility';

/**
 * Hitelesség-jelvény a felhasználónév mellé: Új tag / Aktív tag / Törzstag.
 * A szint a valódi hozzájárulásokból (téma + hozzászólás) számolódik.
 */
export function CredibilityBadge({ contributions }: { contributions: number }) {
  const tier = tierFor(contributions);
  const cfg =
    tier === 'torzs'
      ? { label: 'Törzstag', Icon: Award, cls: 'bg-amber-500/15 text-amber-400' }
      : tier === 'aktiv'
        ? { label: 'Aktív tag', Icon: Sparkles, cls: 'bg-accent-strong/15 text-accent-soft' }
        : { label: 'Új tag', Icon: Sprout, cls: 'bg-positive/10 text-positive' };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
      title={`${contributions} hozzájárulás (téma + hozzászólás)`}
    >
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
}
