import type { LucideIcon } from 'lucide-react';

/** Kis statisztika-kártya (szám + felirat), sorokba rendezhető. */
export function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-strong/15 text-accent-soft">
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-fg">{value}</p>
          <p className="truncate text-xs text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
