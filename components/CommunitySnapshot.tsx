import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import type { Snapshot } from '@/data/types';

/**
 * "Közösség egy pillantásban" – a CrowdMind ikonikus eleme.
 * Mellette / Ellene / Bizonytalan arány egy sávon + szavazat- és hozzászólásszám.
 */
export function CommunitySnapshot({
  snapshot,
  commentsCount,
}: {
  snapshot: Snapshot;
  commentsCount: number;
}) {
  return (
    <div className="mt-4 rounded-xl border border-line bg-bg-elevated/60 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Közösség egy pillantásban
        </span>
        <span className="text-xs text-muted">
          {formatCount(snapshot.votes)} szavazat · {formatCount(commentsCount)} hozzászólás
        </span>
      </div>

      {/* Arány-sáv */}
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-line">
        <div className="bg-positive" style={{ width: `${snapshot.for}%` }} />
        <div className="bg-neutral" style={{ width: `${snapshot.uncertain}%` }} />
        <div className="bg-negative" style={{ width: `${snapshot.against}%` }} />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs">
        <Stat icon={ThumbsUp} color="text-positive" value={snapshot.for} label="Mellette" />
        <Stat icon={HelpCircle} color="text-neutral" value={snapshot.uncertain} label="Bizonytalan" />
        <Stat icon={ThumbsDown} color="text-negative" value={snapshot.against} label="Ellene" />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: typeof ThumbsUp;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={13} className={color} />
      <span className="font-semibold text-fg">{value}%</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}
