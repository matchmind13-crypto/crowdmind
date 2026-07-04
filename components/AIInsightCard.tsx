import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Egységes AI insight kártya keret. */
export function AIInsightCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('rounded-xl border border-line bg-bg-elevated/70 p-4', className)}>
      <h4 className="mb-3 text-sm font-semibold text-fg">{title}</h4>
      {children}
    </div>
  );
}

/** Zöld pipás lista (fő témák, top érvek). */
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-fg-soft">
          <Check size={15} className="mt-0.5 shrink-0 text-positive" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
