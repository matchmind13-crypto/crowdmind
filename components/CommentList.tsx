'use client';
import { useState } from 'react';
import { ChevronUp, ChevronDown, MessageCircle, Share2, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { UserBadge } from './UserBadge';
import { getUser } from '@/data/users';
import { formatCount } from '@/lib/utils';
import type { Comment, BadgeKind } from '@/data/types';

const BADGE_LABEL: Record<BadgeKind, string> = {
  expert: 'Szakértő',
  experience: 'Valódi tapasztalat',
  trusted: 'Hiteles válaszadó',
  top: 'Top kommentelő',
  owner: 'Tulajdonos',
  moderator: 'Moderátor',
};

export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="mt-4 space-y-3">
      {comments.map((c) => (
        <CommentRow key={c.id} comment={c} />
      ))}
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  const user = getUser(comment.userId);
  const [vote, setVote] = useState<0 | 1 | -1>(0);
  const score = comment.votes + vote;

  return (
    <div className="rounded-xl border border-line bg-card-2/60 p-3.5">
      <div className="flex items-center gap-2">
        <UserBadge user={user} size="sm" />
        {comment.badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-strong/15 px-2 py-0.5 text-[11px] font-medium text-accent-soft">
            <BadgeCheck size={12} />
            {BADGE_LABEL[comment.badge]}
          </span>
        )}
        <span className="text-xs text-muted">· {comment.ago}</span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-fg-soft">{comment.body}</p>

      <div className="mt-2.5 flex items-center gap-1 text-muted">
        <div className="flex items-center gap-0.5 rounded-full bg-bg-elevated px-1 py-0.5">
          <button
            onClick={() => setVote((v) => (v === 1 ? 0 : 1))}
            className={`grid h-6 w-6 place-items-center rounded-full transition-colors hover:text-positive ${vote === 1 ? 'text-positive' : ''}`}
            aria-label="Egyetértek"
          >
            <ChevronUp size={16} />
          </button>
          <span className={`min-w-8 text-center text-xs font-semibold ${vote === 1 ? 'text-positive' : vote === -1 ? 'text-negative' : 'text-fg-soft'}`}>
            {formatCount(score)}
          </span>
          <button
            onClick={() => setVote((v) => (v === -1 ? 0 : -1))}
            className={`grid h-6 w-6 place-items-center rounded-full transition-colors hover:text-negative ${vote === -1 ? 'text-negative' : ''}`}
            aria-label="Nem értek egyet"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        <CommentAction icon={MessageCircle} label="Válasz" />
        <CommentAction icon={Share2} label="Megosztás" />
        <button className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-hover hover:text-fg-soft">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

function CommentAction({ icon: Icon, label }: { icon: typeof MessageCircle; label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover hover:text-fg-soft">
      <Icon size={14} />
      {label}
    </button>
  );
}
