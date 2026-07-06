'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Compass, Flame, ArrowUpRight } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PostCompactCard } from '@/components/PostCompactCard';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { SentimentGauge } from '@/components/SentimentGauge';
import { usePosts } from '@/lib/usePosts';
import { CATEGORIES } from '@/lib/categories';
import { formatCount } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * Felfedezés – új témák böngészése a Kezdőlaptól eltérő, kompakt rács-elrendezésben.
 * Valódi adat: a posztok és a kategória-számlálók az adatbázisból jönnek.
 * A sorrend szándékosan "keverés" (stabil hash), hogy ne csak a legfrissebbet lásd.
 */
export default function DiscoverPage() {
  const { posts, loading } = usePosts();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // Kategóriánkénti valódi darabszám
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    (posts ?? []).forEach((p) => m.set(p.category[0], (m.get(p.category[0]) ?? 0) + 1));
    return m;
  }, [posts]);

  // Stabil "felfedező" keverés (nem időrend, nem népszerűség)
  const mixed = useMemo(() => {
    const arr = [...(posts ?? [])];
    arr.sort((a, b) => (((a.id * 2654435761) >>> 0) % 1000) - (((b.id * 2654435761) >>> 0) % 1000));
    return selectedCat ? arr.filter((p) => p.category[0] === selectedCat) : arr;
  }, [posts, selectedCat]);

  // "Felkapott most": a legtöbb aktivitású témák (valódi szavazat+komment alapján)
  const hot = useMemo(
    () => [...(posts ?? [])]
      .sort((a, b) => (b.yesVotes + b.noVotes + b.commentsCount * 2) - (a.yesVotes + a.noVotes + a.commentsCount * 2))
      .slice(0, 5),
    [posts],
  );

  return (
    <AppShell
      right={
        <>
          <PanelCard>
            <PanelHeader title="Felkapott most" />
            <div className="space-y-1">
              {hot.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/post/${p.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-hover"
                >
                  <span className="w-4 shrink-0 text-sm font-bold text-muted">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg-soft">{p.title}</span>
                    <span className="text-xs text-muted">
                      {formatCount(p.yesVotes + p.noVotes)} szavazat · {formatCount(p.commentsCount)} hozzászólás
                    </span>
                  </span>
                  <ArrowUpRight size={15} className="shrink-0 text-positive" />
                </Link>
              ))}
              {!loading && hot.length === 0 && (
                <p className="px-2 py-2 text-sm text-muted">Még nincs elég adat.</p>
              )}
            </div>
          </PanelCard>

          {/* Globális hangulat – dekoráció (mock adat, lásd data/trends.ts) */}
          <SentimentGauge />
        </>
      }
    >
      <PageHeader
        icon={Compass}
        title="Felfedezés"
        subtitle="Böngéssz témák között kategóriák szerint – nem időrendben, hanem felfedező sorrendben"
      />

      {/* Kategória-választó kártyák valódi darabszámmal */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = selectedCat === cat.name;
          const count = catCounts.get(cat.name) ?? 0;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCat(active ? null : cat.name)}
              className={cn(
                'rounded-2xl border p-3.5 text-left transition-colors',
                active
                  ? 'border-accent/50 bg-accent-strong/15'
                  : 'border-line bg-card hover:border-accent/30 hover:bg-card-2',
              )}
            >
              <Icon size={18} className={active ? 'text-accent-soft' : 'text-muted'} />
              <p className="mt-2 truncate text-sm font-semibold text-fg">{cat.name}</p>
              <p className="text-xs text-muted">{count} téma</p>
            </button>
          );
        })}
      </div>

      {/* Poszt-rács */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-line bg-card" />
          ))}
        </div>
      ) : mixed.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Flame size={28} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">
            {selectedCat ? `Még nincs téma a(z) ${selectedCat} kategóriában.` : 'Még nincs felfedezhető téma.'}
          </p>
          <Link
            href="/create"
            className="mt-4 inline-block rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            Indíts egyet te!
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-4 sm:grid-cols-2">
          {mixed.map((p) => (
            <PostCompactCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
