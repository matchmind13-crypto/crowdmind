'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Rss, Inbox, Plus, RefreshCw, Sparkles, Flame, Clock, Heart } from 'lucide-react';
import { PostCard } from './PostCard';
import { DebateOfTheDay, pickDebateOfTheDay } from './DebateOfTheDay';
import { usePreferences } from './PreferencesProvider';
import { usePosts } from '@/lib/usePosts';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

type Tab = 'neked' | 'felkapott' | 'friss';

const LAST_VISIT_KEY = 'crowdmind_last_visit';

/**
 * A fő hírfolyam — a visszatérés köré strukturálva:
 * - "Üdv újra!" sáv: mi történt a legutóbbi látogatásod óta,
 * - Neked: a követett kategóriáid elöl, de a többi téma is ott van alattuk
 *   (nem üres a feed akkor sem, ha a kedvenc kategóriádban épp csend van),
 * - Felkapott: a legaktívabb témák,
 * - Friss: szigorú időrend.
 */
export function Feed() {
  const { preferred } = usePreferences();
  const { posts, error } = usePosts();
  const [tab, setTab] = useState<Tab>('neked');
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  // Legutóbbi látogatás beolvasása, majd azonnali frissítése.
  useEffect(() => {
    try {
      setLastVisit(window.localStorage.getItem(LAST_VISIT_KEY));
      window.localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    } catch {
      // privát mód – nem baj
    }
  }, []);

  const sinceVisit = useMemo(() => {
    if (!posts || !lastVisit) return null;
    const fresh = posts.filter((p) => p.createdAt > lastVisit);
    if (fresh.length === 0) return null;
    const inPreferred = preferred
      ? fresh.filter((p) => preferred.includes(p.category[0])).length
      : 0;
    return { total: fresh.length, inPreferred };
  }, [posts, lastVisit, preferred]);

  const ordered = useMemo(() => {
    const list = posts ?? [];
    if (tab === 'friss') {
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    if (tab === 'felkapott') {
      return [...list].sort(
        (a, b) =>
          (b.yesVotes + b.noVotes + b.commentsCount * 2) -
          (a.yesVotes + a.noVotes + a.commentsCount * 2),
      );
    }
    // "Neked": követett kategóriák elöl (időrendben), utána a többi (időrendben)
    if (!preferred || preferred.length === 0) {
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const mine = list.filter((p) => preferred.includes(p.category[0]));
    const rest = list.filter((p) => !preferred.includes(p.category[0]));
    const byDate = (a: typeof list[number], b: typeof list[number]) => b.createdAt.localeCompare(a.createdAt);
    return [...mine.sort(byDate), ...rest.sort(byDate)];
  }, [posts, tab, preferred]);

  // "Neked" fül: a választott témakörök posztjai külön, feliratozott blokkban.
  const nekedGroups = useMemo(() => {
    if (tab !== 'neked' || !preferred || preferred.length === 0 || !posts) return null;
    const byDate = (a: (typeof posts)[number], b: (typeof posts)[number]) =>
      b.createdAt.localeCompare(a.createdAt);
    return {
      topics: preferred,
      mine: posts.filter((p) => preferred.includes(p.category[0])).sort(byDate),
      rest: posts.filter((p) => !preferred.includes(p.category[0])).sort(byDate),
    };
  }, [tab, posts, preferred]);

  const debate = useMemo(() => pickDebateOfTheDay(posts ?? []), [posts]);

  const TABS: { id: Tab; label: string; icon: typeof Heart }[] = [
    { id: 'neked', label: 'Neked', icon: Heart },
    { id: 'felkapott', label: 'Felkapott', icon: Flame },
    { id: 'friss', label: 'Friss', icon: Clock },
  ];

  return (
    <div className="space-y-5">
      {/* A nap vitája – a legaktívabb, legmegosztóbb téma kiemelve */}
      {debate && <DebateOfTheDay post={debate} />}

      {/* Üdv újra! – mi történt a legutóbbi látogatásod óta */}
      {sinceVisit && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/25 bg-accent-strong/10 px-4 py-2.5 text-sm">
          <Sparkles size={15} className="shrink-0 text-accent-soft" />
          <span className="text-fg-soft">
            <span className="font-semibold text-fg">Üdv újra!</span>{' '}
            {sinceVisit.total} új téma érkezett a legutóbbi látogatásod óta
            {sinceVisit.inPreferred > 0 && (
              <> — ebből <span className="font-semibold text-accent-soft">{sinceVisit.inPreferred} a követett kategóriáidban</span></>
            )}
            .
          </span>
        </div>
      )}

      {/* Fülek */}
      <div className="flex items-center gap-1 rounded-xl border border-line bg-card p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors',
              tab === id ? 'bg-accent-strong text-white' : 'text-muted hover:text-fg-soft',
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-sm text-fg-soft">
          <RefreshCw size={15} className="text-negative" />
          Nem sikerült betölteni a posztokat: {error}
        </div>
      )}

      {posts === null ? (
        <>
          <div className="h-64 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-64 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : ordered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Még nincs egyetlen téma sem.</p>
          <Link
            href="/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            <Plus size={15} />
            Hozd létre az első témát
          </Link>
        </div>
      ) : nekedGroups ? (
        <>
          {/* A választott témaköreid posztjai — ez a személyre szabott rész */}
          <SectionHeader icon={Heart} title="A témaköreidből" count={nekedGroups.mine.length} />
          {nekedGroups.mine.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-card p-6 text-center">
              <p className="text-sm text-fg-soft">
                A választott témaköreidben még nincs téma — legyél te az első!
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {nekedGroups.topics.slice(0, 6).map((name) => {
                  const Icon = CATEGORIES.find((c) => c.name === name)?.icon ?? Rss;
                  return (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-strong/10 px-2.5 py-1 text-xs text-fg-soft"
                    >
                      <Icon size={11} className="text-accent-soft" />
                      {name}
                    </span>
                  );
                })}
                {nekedGroups.topics.length > 6 && (
                  <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                    +{nekedGroups.topics.length - 6} további
                  </span>
                )}
              </div>
              <Link
                href="/create"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
              >
                <Plus size={15} />
                Indíts témát az egyikben
              </Link>
            </div>
          ) : (
            nekedGroups.mine.map((post) => <PostCard key={post.id} post={post} />)
          )}

          {/* A többi friss téma — hogy sose legyen üres a hírfolyam */}
          {nekedGroups.rest.length > 0 && (
            <>
              <SectionHeader icon={Clock} title="További friss témák" count={nekedGroups.rest.length} />
              {nekedGroups.rest.map((post) => <PostCard key={post.id} post={post} />)}
            </>
          )}
        </>
      ) : (
        ordered.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}

/** Szakasz-fejléc a "Neked" fül blokkjaihoz (a Követett oldal stílusában). */
function SectionHeader({
  icon: Icon,
  title,
  count,
}: {
  icon: typeof Heart;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-strong/15 text-accent-soft">
        <Icon size={16} />
      </span>
      <h2 className="text-base font-bold text-fg">{title}</h2>
      <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 text-xs font-semibold text-accent-soft">
        {count} téma
      </span>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}
