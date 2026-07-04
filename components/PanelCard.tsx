import type { ReactNode } from 'react';

/** Egységes jobb oldali panel kártya. */
export function PanelCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-line bg-card p-4">{children}</div>;
}

export function PanelHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-wider text-fg">{title}</h3>
      {action && (
        <button className="text-xs font-medium text-accent-soft transition-colors hover:text-accent">
          {action}
        </button>
      )}
    </div>
  );
}
