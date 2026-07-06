import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Egységes oldal-fejléc az aloldalakhoz (ikon + cím + alcím + opcionális akció). */
export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5 panel-gradient">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-strong/25 text-accent-soft ring-1 ring-accent/30">
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-fg">{title}</h1>
        <p className="truncate text-sm text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
