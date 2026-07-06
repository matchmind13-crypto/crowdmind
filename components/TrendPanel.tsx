'use client';
import Link from 'next/link';
import { ArrowUpRight, Flame } from 'lucide-react';
import { usePosts } from '@/lib/usePosts';
import { formatCount } from '@/lib/utils';
import { PanelCard, PanelHeader, PanelFooterLink } from './PanelCard';

// A kis trend-ikonok háttérszínei (csak dekoráció, kategóriánként váltakozik).
const DOT_COLORS = ['#f59e0b', '#60a5fa', '#ef4444', '#22c55e', '#a78bfa'];

/**
 * Trendek mini-panel – VALÓDI adat: a legaktívabb témák
 * (szavazatok + 2×hozzászólások pontszám alapján), a /trending oldallal azonos logikával.
 */
export function TrendPanel() {
  const { posts, loading } = usePosts();

  const top = [...(posts ?? [])]
    .map((p) => ({ ...p, score: p.yesVotes + p.noVotes + p.commentsCount * 2 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <PanelCard>
      <PanelHeader title="Trendek" action="Összes trend" actionHref="/trending" />
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-card-2" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <p className="px-2 py-3 text-sm text-muted">Még nincs trendelő téma.</p>
      ) : (
        <div className="space-y-1">
          {top.map((t, i) => (
            <Link
              key={t.id}
              href={`/post/${t.id}`}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-hover"
            >
              <span className="w-3 shrink-0 text-sm font-bold text-muted">{i + 1}</span>
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white"
                style={{ background: `linear-gradient(135deg, ${DOT_COLORS[i % DOT_COLORS.length]}, ${DOT_COLORS[i % DOT_COLORS.length]}99)` }}
              >
                <Flame size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg-soft">{t.title}</span>
                <span className="text-xs text-muted">
                  {formatCount(t.yesVotes + t.noVotes)} szavazat · {formatCount(t.commentsCount)} hozzászólás
                </span>
              </span>
              <ArrowUpRight size={17} className="shrink-0 text-positive" />
            </Link>
          ))}
        </div>
      )}
      <PanelFooterLink label="Összes trend megtekintése" href="/trending" />
    </PanelCard>
  );
}
