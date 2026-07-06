'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Bookmark, Share2, MoreHorizontal, Eye, Layers } from 'lucide-react';
import { isSaved, toggleSaved } from '@/lib/savedPosts';
import { UserBadge } from './UserBadge';
import { PostTypeBadge } from './PostTypeBadge';
import { MediaGallery } from './MediaGallery';
import { CommunitySnapshot } from './CommunitySnapshot';
import { CollapsibleComments } from './CollapsibleComments';
import { CollapsibleAIAnalysis } from './CollapsibleAIAnalysis';
import { formatCount } from '@/lib/utils';
import type { FeedPost } from '@/data/types';

export function PostCard({ post }: { post: FeedPost }) {
  // Mentés állapot – jelenleg localStorage-alapú (lásd lib/savedPosts.ts megjegyzését).
  const [saved, setSaved] = useState(false);
  useEffect(() => { setSaved(isSaved(post.id)); }, [post.id]);

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
        <span className="text-sm text-muted">· {post.ago}</span>
        <span className="inline-flex items-center gap-1 text-sm text-muted">
          · <Eye size={14} /> {formatCount(post.views)} megtekintés
        </span>

        <div className="ml-auto flex items-center gap-2">
          <ActionButton
            icon={Bookmark}
            label="Mentés"
            active={saved}
            onClick={() => setSaved(toggleSaved(post.id))}
          />
          <ActionButton icon={Share2} label="Megosztás" />
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-hover hover:text-fg-soft">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

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
      <CollapsibleAIAnalysis commentsCount={post.commentsCount} views={post.views} />
    </article>
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
