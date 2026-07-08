'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Bookmark, Bell, Share2, MoreHorizontal, Eye, Layers, Trash2, Loader2 } from 'lucide-react';
import { isSaved, toggleSaved } from '@/lib/savedPosts';
import { isFollowingPost, toggleFollowPost } from '@/lib/postFollows';
import { fetchContributionCounts } from '@/lib/credibility';
import { supabase } from '@/lib/supabase';
import { deleteOwnPost } from '@/lib/postsDb';
import { UserBadge } from './UserBadge';
import { CredibilityBadge } from './CredibilityBadge';
import { ReportButton } from './ReportButton';
import { PostTypeBadge } from './PostTypeBadge';
import { MediaGallery } from './MediaGallery';
import { CommunitySnapshot } from './CommunitySnapshot';
import { CollapsibleComments } from './CollapsibleComments';
import { CollapsibleAIAnalysis } from './CollapsibleAIAnalysis';
import { formatCount } from '@/lib/utils';
import type { FeedPost } from '@/data/types';

export function PostCard({ post }: { post: FeedPost }) {
  // Mentés állapot – bejelentkezve a fiókhoz kötve (saved_posts tábla), különben helyi.
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followMsg, setFollowMsg] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [authorContribs, setAuthorContribs] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    void isSaved(post.id).then((s) => { if (active) setSaved(s); });
    void isFollowingPost(post.id).then((f) => { if (active) setFollowing(f); });
    supabase.auth.getSession().then(({ data }) => { if (active) setUid(data.session?.user?.id ?? null); });
    if (post.authorId) {
      void fetchContributionCounts([post.authorId]).then((m) => {
        if (active) setAuthorContribs(m.get(post.authorId!) ?? 0);
      });
    }
    return () => { active = false; };
  }, [post.id, post.authorId]);

  const isOwn = !!uid && post.authorId === uid;

  async function handleFollow() {
    const res = await toggleFollowPost(post.id);
    if (res.needsLogin) {
      setFollowMsg('A követéshez jelentkezz be.');
      setTimeout(() => setFollowMsg(null), 3500);
      return;
    }
    if (res.unavailable) {
      setFollowMsg('A követés funkció hamarosan elérhető.');
      setTimeout(() => setFollowMsg(null), 3500);
      return;
    }
    setFollowing(res.following);
    setFollowMsg(res.following ? 'Értesítünk minden új hozzászólásról. 🔔' : null);
    if (res.following) setTimeout(() => setFollowMsg(null), 3500);
  }

  return (
    <article className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      {/* Kategória breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted">
        <Layers size={15} className="text-accent-soft" />
        {post.category.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-line" />}
            <span className={i === post.category.length - 1 ? 'text-fg-soft' : ''}>{c}</span>
          </span>
        ))}
      </div>

      {/* Cím */}
      <h2 className="mt-3 text-2xl font-bold leading-snug text-fg">{post.title}</h2>

      {/* Meta sor + akciók */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <PostTypeBadge type={post.type} />
        <UserBadge username={post.authorName} size="sm" />
        {authorContribs !== null && <CredibilityBadge contributions={authorContribs} />}
        <span className="text-sm text-muted">· {post.ago}</span>
        <span className="inline-flex items-center gap-1 text-sm text-muted">
          · <Eye size={14} /> {formatCount(post.views)} megtekintés
        </span>

        <div className="ml-auto flex items-center gap-2">
          {!isOwn && (
            <ActionButton
              icon={Bell}
              label={following ? 'Követed' : 'Követés'}
              active={following}
              onClick={() => { void handleFollow(); }}
            />
          )}
          <ActionButton
            icon={Bookmark}
            label="Mentés"
            active={saved}
            onClick={() => { void toggleSaved(post.id).then(setSaved); }}
          />
          <ActionButton icon={Share2} label="Megosztás" />
          {isOwn ? (
            <OwnPostMenu postId={post.id} />
          ) : (
            <ReportButton targetType="post" targetId={post.id} />
          )}
        </div>
      </div>

      {followMsg && (
        <p className="mt-2 text-right text-xs text-accent-soft">{followMsg}</p>
      )}

      {/* Szöveg */}
      {post.body.length > 0 && (
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-fg-soft">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Média */}
      <MediaGallery images={post.media} />

      {/* Közösség egy pillantásban – valódi szavazással */}
      <CommunitySnapshot
        postId={post.id}
        yesVotes={post.yesVotes}
        noVotes={post.noVotes}
        commentsCount={post.commentsCount}
      />

      {/* Lenyitható panelek: előbb hozzászólások, alatta AI elemzés */}
      <CollapsibleComments postId={post.id} count={post.commentsCount} />
      <CollapsibleAIAnalysis postId={post.id} commentsCount={post.commentsCount} views={post.views} />
    </article>
  );
}

/** "..." menü a SAJÁT posztodon: törlés kétlépcsős megerősítéssel. */
function OwnPostMenu({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setState('idle');
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function handleDelete() {
    setState('deleting');
    const res = await deleteOwnPost(postId);
    if (res.ok) window.location.href = '/';
    else setState('idle');
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-hover hover:text-fg-soft"
        aria-label="További műveletek"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-card-2 p-1 shadow-2xl shadow-black/50">
          {state === 'idle' && (
            <button
              onClick={() => setState('confirm')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-negative transition-colors hover:bg-hover"
            >
              <Trash2 size={15} />
              Téma törlése
            </button>
          )}
          {state === 'confirm' && (
            <div className="px-3 py-2">
              <p className="mb-2 text-sm text-fg-soft">Biztos törlöd? Ez nem vonható vissza.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleDelete()}
                  className="flex-1 rounded-lg bg-negative/15 py-1.5 text-sm font-semibold text-negative hover:bg-negative/25"
                >
                  Törlés
                </button>
                <button
                  onClick={() => setState('idle')}
                  className="flex-1 rounded-lg border border-line py-1.5 text-sm text-fg-soft hover:bg-hover"
                >
                  Mégse
                </button>
              </div>
            </div>
          )}
          {state === 'deleting' && (
            <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" /> Törlés…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Bookmark;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-accent/40 bg-accent-strong/15 text-accent-soft'
          : 'border-line text-fg-soft hover:bg-hover'
      }`}
    >
      <Icon size={16} className={active ? 'fill-current' : ''} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
