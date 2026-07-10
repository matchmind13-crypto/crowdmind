'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Compass, Flame, ArrowUpRight, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PostCompactCard } from '@/components/PostCompactCard';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { SentimentGauge } from '@/components/SentimentGauge';
import { usePreferences } from '@/components/PreferencesProvider';
import { usePosts } from '@/lib/usePosts';
import { CATEGORIES } from '@/lib/categories';
import { formatCount } from '@/lib/utils';
import { cn } from '@/lib/utils';

/** Ennyi kategória-kártya látszik összecsukva (a követettek mindig elöl). */
const COLLAPSED_CAT_COUNT = 12;

/**
 * Felfedezés – új témák böngészése a Kezdőlaptól eltérő, kompakt rács-elrendezésben.
 * Személyre szabott: a választott témaköreid kártyái és posztjai kerülnek előre,
 * "Követed" jelöléssel. A többi poszt sorrendje stabil "felfedező" keverés.
 */
export default function DiscoverPage() {
  return (
    <AppShell right={<DiscoverRail />}>
      <DiscoverContent />
    </AppShell>
  );
}

function DiscoverContent() {
  const { posts, loading } = usePosts();
  const { preferred } = usePreferences();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showAllCats, setShowAllCats] = useState(false);

  const followed = useMemo(() => new Set(preferred ?? []), [preferred]);

  // Kategóriánkénti valódi darabszám
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    (posts ?? []).forEach((p) => m.set(p.category[0], (m.get(p.category[0]) ?? 0) + 1));
    return m;
  }, [posts]);

  // Kategória-kártyák: a követett témakörök elöl (a sort stabil, a többi sorrendje marad)
  const orderedCats = useMemo(() => {
    if (followed.size === 0) return CATEGORIES;
    return [...CATEGORIES].sort(
      (a, b) => Number(followed.has(b.name)) - Number(followed.has(a.name)),
    );
  }, [followed]);

  const visibleCats = useMemo(() => {
    if (showAllCats) return orderedCats;
    const slice = orderedCats.slice(0, COLLAPSED_CAT_COUNT);
    // Ha épp egy "rejtett" kategória van kiválasztva, azt is mutassuk.
    if (selectedCat && !slice.some((c) => c.name === selectedCat)) {
      const sel = orderedCats.find((c) => c.name === selectedCat);
      if (sel) slice.push(sel);
    }
    return slice;
  }, [orderedCats, showAllCats, selectedCat]);

  // Poszt-rács: a követett témakörök posztjai elöl, azon belül stabil "felfedező" keverés
  const mixed = useMemo(() => {
    const hash = (id: number) => ((id * 2654435761) >>> 0) % 1000;
    const arr = [...(posts ?? [])];
    arr.sort((a, b) => {
      const fa = followed.has(a.category[0]) ? 0 : 1;
      const fb = followed.has(b.category[0]) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return hash(a.id) - hash(b.id);
    });
    return selectedCat ? arr.filter((p) => p.category[0] === selectedCat) : arr;
  }, [posts, selectedCat, followed]);

  return (
    <>
      <PageHeader
        icon={Compass}
        title="Felfedezés"
        subtitle={
          followed.size > 0
            ? 'A választott témaköreid tartalma elöl — utána jön a felfedezés'
            : 'Böngéssz témák között kategóriák szerint – nem időrendben, hanem felfedező sorrendben'
        }
      />

      {/* Kategória-választó kártyák valódi darabszámmal, követettek elöl */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {visibleCats.map((cat) => {
          const Icon = cat.icon;
          const active = selectedCat === cat.name;
          const count = catCounts.get(cat.name) ?? 0;
          const isFollowed = followed.has(cat.name);
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
              <div className="flex items-start justify-between gap-1">
                <Icon size={18} className={active || isFollowed ? 'text-accent-soft' : 'text-muted'} />
                {isFollowed && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-strong/15 px-2 py-0.5 text-[10px] font-semibold text-accent-soft">
                    <Heart size={9} />
                    Követed
                  </span>
                )}
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-fg">{cat.name}</p>
              <p className="text-xs text-muted">{count} téma</p>
            </button>
          );
        })}

        {/* Összecsukás / kibontás — 50 kategóriánál nem fér ki mind egyszerre */}
        <button
          onClick={() => setShowAllCats((v) => !v)}
          className="flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-card-2 p-3.5 text-sm font-medium text-accent-soft transition-colors hover:bg-hover"
        >
          {showAllCats ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          {showAllCats
            ? 'Kevesebb témakör'
            : `Mind az ${CATEGORIES.length} témakör`}
        </button>
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
    </>
  );
}

function DiscoverRail() {
  const { posts, loading } = usePosts();

  // "Felkapott most": a legtöbb aktivitású témák (valódi szavazat+komment alapján)
  const hot = useMemo(
    () => [...(posts ?? [])]
      .sort((a, b) => (b.yesVotes + b.noVotes + b.commentsCount * 2) - (a.yesVotes + a.noVotes + a.commentsCount * 2))
      .slice(0, 5),
    [posts],
  );

  return (
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

      {/* Globális hangulat – valódi szavazatokból számolt mérő */}
      <SentimentGauge />
    </>
  );
}
