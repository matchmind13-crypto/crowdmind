'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Trash2, Check, X, Loader2, CornerDownRight } from 'lucide-react';
import { UserBadge } from './UserBadge';
import { CredibilityBadge } from './CredibilityBadge';
import { ReportButton } from './ReportButton';
import { supabase } from '@/lib/supabase';
import { deleteOwnComment, addComment } from '@/lib/postsDb';
import { setCommentVote } from '@/lib/commentLikes';
import { fetchContributionCounts } from '@/lib/credibility';
import { formatCount } from '@/lib/utils';
import { SITE_URL } from '@/lib/publicConfig';
import type { FeedComment } from '@/data/types';

export type CommentSort = 'legjobb' | 'legvitatottabb' | 'legujabb' | 'legregebbi';

/** Ennél mélyebb szinten már nem húzódik beljebb a szál (mobilon elfogyna a hely). */
const MAX_INDENT = 3;

export function CommentList({
  comments,
  postId,
  sort = 'legjobb',
  onDeleted,
  onReplied,
}: {
  comments: FeedComment[];
  postId: number;
  sort?: CommentSort;
  onDeleted?: (id: number) => void;
  onReplied?: () => void;
}) {
  const [uid, setUid] = useState<string | null>(null);
  const [contribs, setContribs] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUid(data.session?.user?.id ?? null);
    });
    return () => { active = false; };
  }, []);

  // Hitelesség-jelvényekhez: a kommentelők hozzájárulás-számai egy lekérdezéssel.
  useEffect(() => {
    let active = true;
    const ids = comments.map((c) => c.userId).filter((id): id is string => !!id);
    if (ids.length === 0) return;
    void fetchContributionCounts(ids).then((m) => { if (active) setContribs(m); });
    return () => { active = false; };
  }, [comments]);

  // Valódi fa-szálazás: minden válasz a SAJÁT szülője alatt jelenik meg, tetszőleges
  // mélységben (a parent_id láncot követve). A fő hozzászólások a választott rendezés
  // szerint sorakoznak, a válaszok mindig időrendben (beszélgetés-sorrend).
  const tree = useMemo(() => {
    const byId = new Map(comments.map((c) => [c.id, c]));
    const children = new Map<number, FeedComment[]>();
    const roots: FeedComment[] = [];
    comments.forEach((c) => {
      if (c.parentId && byId.has(c.parentId)) {
        const list = children.get(c.parentId) ?? [];
        list.push(c);
        children.set(c.parentId, list);
      } else {
        roots.push(c);
      }
    });
    children.forEach((list) => list.sort((a, b) => a.id - b.id));

    const score = (c: FeedComment) => (c.likes ?? 0) - (c.dislikes ?? 0);
    const volume = (c: FeedComment) => (c.likes ?? 0) + (c.dislikes ?? 0);
    if (sort === 'legjobb') {
      roots.sort((a, b) => score(b) - score(a) || a.id - b.id);
    } else if (sort === 'legvitatottabb') {
      // Vitatott = sok szavazat MINDKÉT irányban: a kisebbik oldal nagysága dönt.
      roots.sort(
        (a, b) =>
          Math.min(b.likes ?? 0, b.dislikes ?? 0) - Math.min(a.likes ?? 0, a.dislikes ?? 0) ||
          volume(b) - volume(a) ||
          a.id - b.id,
      );
    } else if (sort === 'legujabb') {
      roots.sort((a, b) => b.id - a.id);
    } else {
      roots.sort((a, b) => a.id - b.id);
    }
    return { roots, children, byId };
  }, [comments, sort]);

  if (comments.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
        Még nincs hozzászólás – legyél az első!
      </p>
    );
  }
  return (
    <div className="mt-4 space-y-3">
      {tree.roots.map((c) => (
        <ThreadNode
          key={c.id}
          comment={c}
          depth={0}
          kidsOf={tree.children}
          byId={tree.byId}
          postId={postId}
          uid={uid}
          contribs={contribs}
          onDeleted={onDeleted}
          onReplied={onReplied}
        />
      ))}
    </div>
  );
}

/** Egy hozzászólás + a teljes alatta lévő szál, rekurzívan, összecsukási lehetőséggel. */
function ThreadNode({
  comment,
  depth,
  kidsOf,
  byId,
  postId,
  uid,
  contribs,
  onDeleted,
  onReplied,
}: {
  comment: FeedComment;
  depth: number;
  kidsOf: Map<number, FeedComment[]>;
  byId: Map<number, FeedComment>;
  postId: number;
  uid: string | null;
  contribs: Map<string, number>;
  onDeleted?: (id: number) => void;
  onReplied?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const kids = kidsOf.get(comment.id) ?? [];

  // A teljes al-szál mérete (nem csak a közvetlen válaszok) az összecsukó gombhoz.
  const subtreeCount = useMemo(() => {
    let n = 0;
    const stack = [...kids];
    const seen = new Set<number>();
    while (stack.length > 0) {
      const c = stack.pop()!;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      n += 1;
      (kidsOf.get(c.id) ?? []).forEach((k) => stack.push(k));
    }
    return n;
  }, [kids, kidsOf]);

  // A megengedett mélység felett nem húzódik beljebb a szál — ott chip mutatja, kinek szól.
  const indentMore = depth < MAX_INDENT;
  const parentName =
    depth > 0 && !indentMore && comment.parentId ? (byId.get(comment.parentId)?.username ?? null) : null;

  return (
    <div>
      <CommentRow
        comment={comment}
        postId={postId}
        isOwn={!!uid && comment.userId === uid}
        contributions={comment.userId ? (contribs.get(comment.userId) ?? null) : null}
        replyToName={parentName}
        onDeleted={onDeleted}
        onReplied={onReplied}
      />
      {kids.length > 0 && (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-5 mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-hover hover:text-fg-soft sm:ml-8"
          >
            <CornerDownRight size={12} className="text-accent-soft" />
            {open
              ? `${subtreeCount} válasz elrejtése`
              : `${subtreeCount} válasz mutatása`}
          </button>
          {open && (
            <div
              className={
                indentMore
                  ? 'ml-5 mt-2 space-y-2 border-l-2 border-line pl-3 sm:ml-8'
                  : 'mt-2 space-y-2'
              }
            >
              {kids.map((r) => (
                <ThreadNode
                  key={r.id}
                  comment={r}
                  depth={depth + 1}
                  kidsOf={kidsOf}
                  byId={byId}
                  postId={postId}
                  uid={uid}
                  contribs={contribs}
                  onDeleted={onDeleted}
                  onReplied={onReplied}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** A @felhasznalonev említések kiemelése és linkelése a komment szövegében. */
function BodyWithMentions({ text }: { text: string }) {
  const parts = text.split(/(@[a-z0-9_]{3,20})/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <Link
            key={i}
            href={`/user/${encodeURIComponent(part.slice(1))}`}
            className="font-semibold text-accent-soft hover:underline"
          >
            {part}
          </Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function CommentRow({
  comment,
  postId,
  isOwn,
  contributions,
  replyToName = null,
  onDeleted,
  onReplied,
}: {
  comment: FeedComment;
  postId: number;
  isOwn: boolean;
  contributions: number | null;
  replyToName?: string | null;
  onDeleted?: (id: number) => void;
  onReplied?: () => void;
}) {
  // Valódi, fiókhoz kötött lájk/dislike (comment_likes tábla), optimista frissítéssel.
  const [myVote, setMyVote] = useState<1 | -1 | 0>(comment.myVote);
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [likeMsg, setLikeMsg] = useState<string | null>(null);
  const [delState, setDelState] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  // Válasz-űrlap állapota
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState<{ msg: string; needsLogin?: boolean } | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/post/${postId}`);
      setShareMsg('Link másolva!');
    } catch {
      setShareMsg('A másolás nem sikerült.');
    }
    setTimeout(() => setShareMsg(null), 3000);
  }

  async function sendReply() {
    if (!replyText.trim() || replying) return;
    setReplying(true);
    setReplyError(null);
    const res = await addComment(postId, replyText, comment.id);
    if (!res.ok) {
      setReplyError({ msg: res.error ?? 'Hiba a küldéskor', needsLogin: res.needsLogin });
      setReplying(false);
      return;
    }
    setReplyText('');
    setReplyOpen(false);
    setReplying(false);
    onReplied?.();
  }

  async function handleVote(target: 1 | -1) {
    const next: 1 | -1 | 0 = myVote === target ? 0 : target;
    const res = await setCommentVote(comment.id, next);
    if (res.needsLogin) {
      setLikeMsg('A szavazáshoz jelentkezz be.');
      setTimeout(() => setLikeMsg(null), 3500);
      return;
    }
    if (res.unavailable) {
      setLikeMsg('A szavazat most nem rögzíthető — próbáld újra később.');
      setTimeout(() => setLikeMsg(null), 3500);
      return;
    }
    if (!res.ok) return;
    // Optimista számláló-frissítés: a régi szavazat le, az új fel.
    if (myVote === 1) setLikes((n) => Math.max(0, n - 1));
    if (myVote === -1) setDislikes((n) => Math.max(0, n - 1));
    if (next === 1) setLikes((n) => n + 1);
    if (next === -1) setDislikes((n) => n + 1);
    setMyVote(next);
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
        <UserBadge
          username={comment.username}
          size="sm"
          avatarUrl={comment.avatarUrl}
          linkTo={comment.userId ? `/user/${encodeURIComponent(comment.username)}` : undefined}
        />
        {contributions !== null && <CredibilityBadge contributions={contributions} />}
        <span className="text-xs text-muted">· {comment.ago}</span>
      </div>

      {replyToName && (
        <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-muted">
          <CornerDownRight size={12} className="text-accent-soft" />
          válasz neki: <span className="font-medium text-fg-soft">{replyToName}</span>
        </p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-fg-soft">
        <BodyWithMentions text={comment.body} />
      </p>

      <div className="mt-2.5 flex items-center gap-1 text-muted">
        <div className="flex items-center gap-0.5 rounded-full bg-bg-elevated px-1 py-0.5">
          <button
            onClick={() => void handleVote(1)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
              myVote === 1 ? 'bg-accent-strong/20 text-accent-soft' : 'hover:text-positive'
            }`}
            aria-label={myVote === 1 ? 'Lájk visszavonása' : 'Tetszik'}
          >
            <ThumbsUp size={14} className={myVote === 1 ? 'fill-current' : ''} />
            {formatCount(likes)}
          </button>
          <button
            onClick={() => void handleVote(-1)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
              myVote === -1 ? 'bg-negative/15 text-negative' : 'hover:text-negative'
            }`}
            aria-label={myVote === -1 ? 'Dislike visszavonása' : 'Nem tetszik'}
          >
            <ThumbsDown size={14} className={myVote === -1 ? 'fill-current' : ''} />
            {formatCount(dislikes)}
          </button>
        </div>

        <button
          onClick={() => {
            setReplyOpen((o) => {
              const next = !o;
              // Facebook-stílus: válasznál automatikusan megjelöljük a másik felet.
              if (next && replyText.trim() === '') setReplyText(`@${comment.username} `);
              return next;
            });
            setReplyError(null);
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover hover:text-fg-soft ${replyOpen ? 'bg-hover text-fg-soft' : ''}`}
        >
          <MessageCircle size={14} />
          Válasz
        </button>
        <button
          onClick={() => void handleShare()}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover hover:text-fg-soft"
        >
          {shareMsg === 'Link másolva!' ? <Check size={14} className="text-positive" /> : <Share2 size={14} />}
          Megosztás
        </button>
        {!isOwn && <ReportButton targetType="comment" targetId={comment.id} variant="flag" />}

        {likeMsg && <span className="px-1.5 text-xs text-accent-soft">{likeMsg}</span>}
        {shareMsg && <span className="px-1.5 text-xs text-accent-soft">{shareMsg}</span>}

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

      {/* Inline válasz-űrlap */}
      {replyOpen && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5">
          <CornerDownRight size={15} className="shrink-0 text-muted" />
          <input
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void sendReply(); }}
            placeholder={`Válasz ${comment.username} hozzászólására…`}
            className="min-w-0 flex-1 rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <button
            onClick={() => void sendReply()}
            disabled={replying || !replyText.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-strong px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
          >
            {replying && <Loader2 size={12} className="animate-spin" />}
            Küldés
          </button>
        </div>
      )}
      {replyError && (
        <p className="mt-2 text-xs text-negative">
          {replyError.msg}{' '}
          {replyError.needsLogin && (
            <Link href="/login" className="font-semibold text-accent-soft underline">
              Bejelentkezés
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
