'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, MessagesSquare, ThumbsUp, Layers, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { PostTypeBadge } from '@/components/PostTypeBadge';
import { usePosts } from '@/lib/usePosts';
import { formatCount } from '@/lib/utils';

/**
 * Trendek – a legaktívabb témák rangsorolva, teljes szélességű nézetben.
 * Valódi adat: a rangsor a tényleges szavazat- és hozzászólás-számokból számolódik
 * (pontszám = szavazatok + 2×hozzászólások).
 */
export default function TrendingPage() {
  const { posts, loading } = usePosts();

  const ranked = useMemo(
    () => [...(posts ?? [])]
      .map((p) => ({ ...p, score: p.yesVotes + p.noVotes + p.commentsCount * 2 }))
      .sort((a, b) => b.score - a.score),
    [posts],
  );

  const totals = useMemo(() => {
    const list = posts ?? [];
    const votes = list.reduce((s, p) => s + p.yesVotes + p.noVotes, 0);
    const comments = list.reduce((s, p) => s + p.commentsCount, 0);
    const byCat = new Map<string, number>();
    list.forEach((p) => byCat.set(p.category[0], (byCat.get(p.category[0]) ?? 0) + p.yesVotes + p.noVotes + p.commentsCount));
    const topCat = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '–';
    return { posts: list.length, votes, comments, topCat, byCat };
  }, [posts]);

  const maxCatActivity = Math.max(1, ...[...totals.byCat.values()]);

  return (
    <AppShell wide>
      <PageHeader
        icon={TrendingUp}
        title="Trendek"
        subtitle="A közösség legaktívabb témái – szavazatok és hozzászólások alapján rangsorolva"
      />

      {/* Összesítő statisztikák (valódi adat) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Flame} value={formatCount(totals.posts)} label="Téma összesen" />
        <StatCard icon={ThumbsUp} value={formatCount(totals.votes)} label="Leadott szavazat" />
        <StatCard icon={MessagesSquare} value={formatCount(totals.comments)} label="Hozzászólás" />
        <StatCard icon={Layers} value={totals.topCat} label="Legaktívabb kategória" />
      </div>

      {/* Rangsor */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-fg">Rangsor</h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-card-2" />
            ))}
          </div>
        ) : ranked.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">Még nincs rangsorolható téma.</p>
        ) : (
          <div className="divide-y divide-line">
            {ranked.map((p, i) => {
              // MOCK: a trend-nyíl iránya egyelőre nem valódi historikus adatból jön
              // (nincs időbeli összehasonlítás) – determinisztikus minta.
              // KÉSŐBB CSERÉLENDŐ: pl. elmúlt 24h vs előző 24h aktivitás-különbségre.
              const up = p.id % 3 !== 0;
              return (
                <Link
                  key={p.id}
                  href={`/post/${p.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-hover/40"
                >
                  <span className={`w-8 shrink-0 text-center text-lg font-extrabold ${i < 3 ? 'text-accent-soft' : 'text-muted'}`}>
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-fg">{p.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span className="text-accent-soft">{p.category.join(' › ')}</span>
                      <span>· {p.authorName}</span>
                      <span>· {p.ago}</span>
                    </p>
                  </div>

                  <div className="hidden shrink-0 sm:block">
                    <PostTypeBadge type={p.type} />
                  </div>

                  <div className="hidden shrink-0 text-right md:block">
                    <p className="text-sm font-semibold text-fg">{formatCount(p.yesVotes + p.noVotes)}</p>
                    <p className="text-xs text-muted">szavazat</p>
                  </div>
                  <div className="hidden shrink-0 text-right md:block">
                    <p className="text-sm font-semibold text-fg">{formatCount(p.commentsCount)}</p>
                    <p className="text-xs text-muted">hozzászólás</p>
                  </div>

                  {up ? (
                    <ArrowUpRight size={18} className="shrink-0 text-positive" />
                  ) : (
                    <ArrowDownRight size={18} className="shrink-0 text-negative" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Kategória-aktivitás (valódi adat) */}
      <div className="rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-fg">Kategória-aktivitás</h2>
        {totals.byCat.size === 0 ? (
          <p className="text-sm text-muted">Még nincs adat.</p>
        ) : (
          <div className="space-y-3">
            {[...totals.byCat.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([cat, activity]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm text-fg-soft">{cat}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent"
                      style={{ width: `${Math.max(4, (activity / maxCatActivity) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-semibold text-muted">
                    {formatCount(activity)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
