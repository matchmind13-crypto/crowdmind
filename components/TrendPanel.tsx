import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { trends } from '@/data/trends';
import { formatCount } from '@/lib/utils';
import { PanelCard, PanelHeader } from './PanelCard';

export function TrendPanel() {
  return (
    <PanelCard>
      <PanelHeader title="Trendek" action="Összes trend" />
      <div className="space-y-1">
        {trends.map((t) => (
          <button
            key={t.id}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-hover"
          >
            <span className="w-3 shrink-0 text-sm font-bold text-muted">{t.rank}</span>
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white"
              style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}
            >
              <span className="h-2 w-2 rounded-full bg-white/90" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-fg-soft">{t.title}</span>
              <span className="text-xs text-muted">{formatCount(t.shares)} megosztás</span>
            </span>
            {t.direction === 'up' ? (
              <ArrowUpRight size={17} className="shrink-0 text-positive" />
            ) : (
              <ArrowDownRight size={17} className="shrink-0 text-negative" />
            )}
          </button>
        ))}
      </div>
      <PanelFooter label="Összes trend megtekintése" />
    </PanelCard>
  );
}

export function PanelFooter({ label }: { label: string }) {
  return (
    <button className="mt-3 w-full rounded-xl border border-line bg-card-2 py-2.5 text-sm font-medium text-accent-soft transition-colors hover:bg-hover">
      {label}
    </button>
  );
}
