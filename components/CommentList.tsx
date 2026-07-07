'use client';
import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, MessageCircle, Share2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { UserBadge } from './UserBadge';
import { supabase } from '@/lib/supabase';
import { deleteOwnComment } from '@/lib/postsDb';
import { formatCount } from '@/lib/utils';
import type { FeedComment } from '@/data/types';

export function CommentList({
  comments,
  onDeleted,
}: {
  comments: FeedComment[];
  onDeleted?: (id: number) => void;
}) {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUid(data.session?.user?.id ?? null);
    });
    return () => { active = false; };
  }, []);

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
        <CommentRow key={c.id} comment={c} isOwn={!!uid && c.userId === uid} onDeleted={onDeleted} />
      ))}
    </div>
  );
}

function CommentRow({
  comment,
  isOwn,
  onDeleted,
}: {
  comment: FeedComment;
  isOwn: boolean;
  onDeleted?: (id: number) => void;
}) {
  // A komment-kedvelés egyelőre csak helyi (nem mentődik) – vizuális visszajelzés.
  const [vote, setVote] = useState<0 | 1 | -1>(0);
  const [delState, setDelState] = useState<'idle' | 'confirm' | 'deleting'>('idle');

  async function handleDelete() {
    setDelState('deleting');
    const res = await deleteOwnComment(comment.id);
    if (res.ok) onDeleted?.(comment.id);
    else setDelState('idle');
  }

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

        {/* Törlés – csak a saját hozzászólásodnál, kétlépcsős megerősítéssel */}
        {isOwn && delState === 'idle' && (
          <button
            onClick={() => setDelState('confirm')}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-negative/10 hover:text-negative"
          >
            <Trash2 size={13} />
            Törlés
          </button>
        )}
        {isOwn && delState === 'confirm' && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs">
            <span className="text-negative">Biztos?</span>
            <button
              onClick={() => void handleDelete()}
              className="grid h-6 w-6 place-items-center rounded-full bg-negative/15 text-negative hover:bg-negative/25"
              aria-label="Törlés megerősítése"
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => setDelState('idle')}
              className="grid h-6 w-6 place-items-center rounded-full bg-hover text-muted"
              aria-label="Mégse"
            >
              <X size={13} />
            </button>
          </span>
        )}
        {isOwn && delState === 'deleting' && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted">
            <Loader2 size={13} className="animate-spin" /> Törlés…
          </span>
        )}
      </div>
    </div>
  );
}
