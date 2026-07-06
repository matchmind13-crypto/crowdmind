'use client';
import { useState } from 'react';
import { ChevronUp, ChevronDown, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { UserBadge } from './UserBadge';
import { formatCount } from '@/lib/utils';
import type { FeedComment } from '@/data/types';

export function CommentList({ comments }: { comments: FeedComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
        Még nincs hozzászólás – legyél az első!
      </p>
    );
  }
  return (
    <div className="mt-4 space-y-3">
      {comments.map((c) => (
        <CommentRow key={c.id} comment={c} />
      ))}
    </div>
  );
}

function CommentRow({ comment }: { comment: FeedComment }) {
  // A komment-kedvelés egyelőre csak helyi (nem mentődik) – vizuális visszajelzés.
  const [vote, setVote] = useState<0 | 1 | -1>(0);

  return (
    <div className="rounded-xl border border-line bg-card-2/60 p-3.5">
      <div className="flex items-center gap-2">
        <UserBadge username={comment.username} size="sm" />
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
          <span className={`min-w-6 text-center text-xs font-semibold ${vote === 1 ? 'text-positive' : vote === -1 ? 'text-negative' : 'text-fg-soft'}`}>
            {formatCount(Math.max(0, vote))}
          </span>
          <button
            onClick={() => setVote((v) => (v === -1 ? 0 : -1))}
            className={`grid h-6 w-6 place-items-center rounded-full transition-colors hover:text-negative ${vote === -1 ? 'text-negative' : ''}`}
            aria-label="Nem értek egyet"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover hover:text-fg-soft">
          <MessageCircle size={14} />
          Válasz
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover hover:text-fg-soft">
          <Share2 size={14} />
          Megosztás
        </button>
        <button className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-hover hover:text-fg-soft">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
