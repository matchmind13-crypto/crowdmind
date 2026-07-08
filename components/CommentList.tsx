'use client';
import { useEffect, useMemo, useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { UserBadge } from './UserBadge';
import { supabase } from '@/lib/supabase';
import { deleteOwnComment } from '@/lib/postsDb';
import { toggleCommentLike } from '@/lib/commentLikes';
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

  // A legjobb érvek felül: lájk szerint csökkenő, azonos lájknál a frissebb elöl
  // (a bejövő lista már időrendben érkezik, a stabil rendezés ezt megtartja).
  const sorted = useMemo(
    () => [...comments].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)),
    [comments],
  );

  if (comments.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
        Még nincs hozzászólás – legyél az első!
      </p>
    );
  }
  return (
    <div className="mt-4 space-y-3">
      {sorted.map((c) => (
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
  // Valódi, fiókhoz kötött lájk (comment_likes tábla), optimista frissítéssel.
  const [liked, setLiked] = useState(comment.likedByMe);
  const [likes, setLikes] = useState(comment.likes);
  const [likeMsg, setLikeMsg] = useState<string | null>(null);
  const [delState, setDelState] = useState<'idle' | 'confirm' | 'deleting'>('idle');

  async function handleLike() {
    const res = await toggleCommentLike(comment.id, liked);
    if (res.needsLogin) {
      setLikeMsg('A lájkoláshoz jelentkezz be.');
      setTimeout(() => setLikeMsg(null), 3500);
      return;
    }
    if (res.unavailable) {
      setLikeMsg('A lájk funkció hamarosan elérhető.');
      setTimeout(() => setLikeMsg(null), 3500);
      return;
    }
    if (res.liked !== liked) {
      setLiked(res.liked);
      setLikes((n) => Math.max(0, n + (res.liked ? 1 : -1)));
    }
  }

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
        <button
          onClick={() => void handleLike()}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
            liked
              ? 'bg-accent-strong/15 text-accent-soft'
              : 'bg-bg-elevated hover:bg-hover hover:text-fg-soft'
          }`}
          aria-label={liked ? 'Lájk visszavonása' : 'Tetszik'}
        >
          <ThumbsUp size={14} className={liked ? 'fill-current' : ''} />
          {formatCount(likes)}
        </button>

        <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover hover:text-fg-soft">
          <MessageCircle size={14} />
          Válasz
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover hover:text-fg-soft">
          <Share2 size={14} />
          Megosztás
        </button>

        {likeMsg && <span className="px-1.5 text-xs text-accent-soft">{likeMsg}</span>}

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
