'use client';
import Link from 'next/link';
import { ChevronRight, Eye, Layers, MessagesSquare, ThumbsUp } from 'lucide-react';
import { PostTypeBadge } from './PostTypeBadge';
import { formatCount } from '@/lib/utils';
import type { FeedPost } from '@/data/types';

/**
 * Kompakt poszt-kártya listás nézetekhez (Felfedezés, Friss, Követett, Mentett).
 * A teljes posztra (saját aloldal) visz.
 */
export function PostCompactCard({ post }: { post: FeedPost }) {
  const total = post.yesVotes + post.noVotes;
  const forPct = total > 0 ? Math.round((post.yesVotes / total) * 100) : 0;

  return (
    <Link
      href={`/post/${post.id}`}
      className="group block rounded-2xl border border-line bg-card p-4 transition-colors hover:border-accent/30 hover:bg-card-2"
    >
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          {/* Kategória breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Layers size={13} className="text-accent-soft" />
            {post.category.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-line" />}
                {c}
              </span>
            ))}
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-fg transition-colors group-hover:text-accent-soft">
            {post.title}
          </h3>

          {post.body[0] && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{post.body[0]}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted">
            <PostTypeBadge type={post.type} />
            <span className="font-medium text-fg-soft">{post.authorName}</span>
            <span>· {post.ago}</span>
            <span className="inline-flex items-center gap-1">
              · <Eye size={12} /> {formatCount(post.views)}
            </span>
          </div>
        </div>

        {post.media[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.media[0]}
            alt=""
            className="hidden h-24 w-32 shrink-0 rounded-xl object-cover ring-1 ring-line sm:block"
          />
        )}
      </div>

      {/* Mini közösségi sáv */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="bg-positive" style={{ width: `${forPct}%` }} />
          <div className="bg-negative" style={{ width: `${total > 0 ? 100 - forPct : 0}%` }} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <ThumbsUp size={12} className="text-positive" />
          {formatCount(total)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <MessagesSquare size={12} className="text-accent-soft" />
          {formatCount(post.commentsCount)}
        </span>
      </div>
    </Link>
  );
}
