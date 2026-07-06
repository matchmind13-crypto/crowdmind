import Link from 'next/link';
import type { ReactNode } from 'react';

/** Egységes jobb oldali panel kártya. */
export function PanelCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-line bg-card p-4">{children}</div>;
}

export function PanelHeader({ title, action, actionHref }: { title: string; action?: string; actionHref?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-wider text-fg">{title}</h3>
      {action && actionHref ? (
        <Link href={actionHref} className="text-xs font-medium text-accent-soft transition-colors hover:text-accent">
          {action}
        </Link>
      ) : action ? (
        <span className="text-xs font-medium text-muted">{action}</span>
      ) : null}
    </div>
  );
}

/** Panel alján lévő, teljes szélességű link. */
export function PanelFooterLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="mt-3 block w-full rounded-xl border border-line bg-card-2 py-2.5 text-center text-sm font-medium text-accent-soft transition-colors hover:bg-hover"
    >
      {label}
    </Link>
  );
}
