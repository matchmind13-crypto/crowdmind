'use client';
import { useState } from 'react';
import Link from 'next/link';
import { GitCompareArrows, ThumbsUp, MessagesSquare, Eye, Scale, Trophy } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PostTypeBadge } from '@/components/PostTypeBadge';
import { usePosts } from '@/lib/usePosts';
import { formatCount } from '@/lib/utils';
import type { FeedPost } from '@/data/types';

/**
 * Összehasonlító – két téma statisztikáinak egymás mellé állítása.
 * Valódi adat: minden szám az adatbázisból jön (szavazatok, kommentek, támogatottság).
 */
export default function ComparePage() {
  const { posts, loading } = usePosts();
  const [idA, setIdA] = useState<number | ''>('');
  const [idB, setIdB] = useState<number | ''>('');

  const a = posts?.find((p) => p.id === idA) ?? null;
  const b = posts?.find((p) => p.id === idB) ?? null;

  return (
    <AppShell wide>
      <PageHeader
        icon={GitCompareArrows}
        title="Összehasonlító"
        subtitle="Állíts egymás mellé két témát, és vesd össze a közösség reakcióit"
      />

      {/* Választók */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { value: idA, set: setIdA, label: 'A téma', exclude: idB },
          { value: idB, set: setIdB, label: 'B téma', exclude: idA },
        ].map((sel, i) => (
          <div key={i} className="rounded-2xl border border-line bg-card p-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{sel.label}</label>
            <select
              value={sel.value}
              onChange={(e) => sel.set(e.target.value ? Number(e.target.value) : '')}
              disabled={loading}
              className="w-full rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg focus:border-accent/40 focus:outline-none"
            >
              <option value="">{loading ? 'Betöltés…' : 'Válassz témát…'}</option>
              {(posts ?? []).filter((p) => p.id !== sel.exclude).map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {!a || !b ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <GitCompareArrows size={28} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Válassz ki két témát a fenti listákból az összehasonlításhoz.</p>
        </div>
      ) : (
        <ComparisonView a={a} b={b} />
      )}
    </AppShell>
  );
}

function ComparisonView({ a, b }: { a: FeedPost; b: FeedPost }) {
  const support = (p: FeedPost) => {
    const total = p.yesVotes + p.noVotes;
    return total > 0 ? Math.round((p.yesVotes / total) * 100) : 0;
  };

  const metrics: { label: string; icon: typeof ThumbsUp; va: number; vb: number; suffix?: string }[] = [
    { label: 'Összes szavazat', icon: ThumbsUp, va: a.yesVotes + a.noVotes, vb: b.yesVotes + b.noVotes },
    { label: 'Támogatottság', icon: Scale, va: support(a), vb: support(b), suffix: '%' },
    { label: 'Hozzászólások', icon: MessagesSquare, va: a.commentsCount, vb: b.commentsCount },
    { label: 'Megtekintések', icon: Eye, va: a.views, vb: b.views },
  ];

  return (
    <>
      {/* Fejlécek */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[a, b].map((p, i) => (
          <Link
            key={p.id}
            href={`/post/${p.id}`}
            className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-accent/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-soft">{i === 0 ? 'A téma' : 'B téma'}</p>
            <h3 className="mt-1.5 line-clamp-2 text-lg font-bold text-fg">{p.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <PostTypeBadge type={p.type} />
              <span>{p.category.join(' › ')}</span>
              <span>· {p.authorName}</span>
              <span>· {p.ago}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Metrikák – kétirányú sávokkal */}
      <div className="rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-fg">Összevetés</h2>
        <div className="space-y-5">
          {metrics.map(({ label, icon: Icon, va, vb, suffix }) => {
            const max = Math.max(va, vb, 1);
            const winnerA = va > vb;
            const winnerB = vb > va;
            return (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <Icon size={13} className="text-accent-soft" />
                  {label}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-16 shrink-0 text-right text-sm font-bold ${winnerA ? 'text-accent-soft' : 'text-fg'}`}>
                    {formatCount(va)}{suffix}
                    {winnerA && <Trophy size={12} className="ml-1 inline text-neutral" />}
                  </span>
                  <div className="flex h-3 flex-1 items-center gap-1">
                    <div className="flex h-full flex-1 justify-end overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-gradient-to-l from-accent-strong to-accent" style={{ width: `${(va / max) * 100}%` }} />
                    </div>
                    <div className="flex h-full flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-gradient-to-r from-positive/80 to-positive" style={{ width: `${(vb / max) * 100}%` }} />
                    </div>
                  </div>
                  <span className={`w-16 shrink-0 text-sm font-bold ${winnerB ? 'text-positive' : 'text-fg'}`}>
                    {formatCount(vb)}{suffix}
                    {winnerB && <Trophy size={12} className="ml-1 inline text-neutral" />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Közösségi megoszlás egymás mellett */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[a, b].map((p) => {
          const total = p.yesVotes + p.noVotes;
          const forPct = total > 0 ? Math.round((p.yesVotes / total) * 100) : 0;
          return (
            <div key={p.id} className="rounded-2xl border border-line bg-card p-4">
              <p className="mb-2 truncate text-xs font-semibold text-muted">{p.title}</p>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-line">
                <div className="bg-positive" style={{ width: `${forPct}%` }} />
                <div className="bg-negative" style={{ width: `${total > 0 ? 100 - forPct : 0}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted">
                <span><span className="font-semibold text-positive">{forPct}%</span> mellette</span>
                <span>{formatCount(total)} szavazat</span>
                <span><span className="font-semibold text-negative">{total > 0 ? 100 - forPct : 0}%</span> ellene</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
