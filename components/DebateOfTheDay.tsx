'use client';
import Link from 'next/link';
import { Flame, MessageSquare, ArrowRight } from 'lucide-react';
import { formatCount } from '@/lib/utils';
import type { FeedPost } from '@/data/types';

/**
 * „A nap vitája” — a legaktívabb ÉS legmegosztóbb téma kiemelése a feed tetején.
 * Tisztán a valódi adatokból számolódik (determinisztikus: mindenki ugyanazt látja):
 * pontszám = aktivitás (szavazat + 2×hozzászólás) × megosztottság-szorzó
 * (minél közelebb az 50-50%-hoz, annál nagyobb vita).
 */
export function pickDebateOfTheDay(posts: FeedPost[]): FeedPost | null {
  const scored = posts
    .map((p) => {
      const votes = p.yesVotes + p.noVotes;
      const activity = votes + p.commentsCount * 2;
      if (activity === 0) return { p, score: 0 };
      const pct = votes > 0 ? (p.yesVotes / votes) * 100 : 50;
      const contested = 1 + (50 - Math.abs(pct - 50)) / 100; // 1.0–1.5
      return { p, score: activity * contested };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.p ?? null;
}

export function DebateOfTheDay({ post }: { post: FeedPost }) {
  const total = post.yesVotes + post.noVotes;
  const pct = total > 0 ? Math.round((post.yesVotes / total) * 100) : 50;

  return (
    <Link
      href={`/post/${post.id}`}
      className="block rounded-2xl border border-accent/35 bg-gradient-to-br from-accent-strong/15 via-card to-card p-5 transition-colors hover:border-accent/60"
    >
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-strong/25 text-accent-soft">
          <Flame size={15} />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-accent-soft">A nap vitája</span>
        <span className="ml-auto rounded-full bg-card-2 px-2.5 py-0.5 text-xs text-muted">{post.category[0]}</span>
      </div>

      <h2 className="mt-3 text-lg font-bold leading-snug text-fg">{post.title}</h2>

      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-line">
        <div className="bg-positive" style={{ width: `${pct}%` }} />
        <div className="bg-negative" style={{ width: `${100 - pct}%` }} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>
          <span className="font-semibold text-positive">{pct}%</span>
          <span className="text-muted"> mellette · </span>
          <span className="font-semibold text-negative">{100 - pct}%</span>
          <span className="text-muted"> ellene</span>
        </span>
        <span className="inline-flex items-center gap-1 text-muted">
          <MessageSquare size={13} />
          {formatCount(post.commentsCount)} hozzászólás · {formatCount(total)} szavazat
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-accent-soft">
          Szólj hozzá <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
