'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { Clock, CalendarDays, Plus, Hash } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PostCompactCard } from '@/components/PostCompactCard';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { StatCard } from '@/components/StatCard';
import { SentimentGauge } from '@/components/SentimentGauge';
import { usePosts } from '@/lib/usePosts';

type Bucket = { label: string; posts: import('@/data/types').FeedPost[] };

/**
 * Friss – a legújabb témák szigorú időrendben, nap szerinti csoportosítással.
 * Valódi adat: a posztok created_at szerint rendezve az adatbázisból.
 */
export default function FreshPage() {
  const { posts, loading } = usePosts();

  const buckets = useMemo<Bucket[]>(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const groups: Bucket[] = [
      { label: 'Ma', posts: [] },
      { label: 'Tegnap', posts: [] },
      { label: 'Ezen a héten', posts: [] },
      { label: 'Korábban', posts: [] },
    ];
    (posts ?? []).forEach((p) => {
      const t = new Date(p.createdAt).getTime();
      if (t >= startOfToday) groups[0].posts.push(p);
      else if (t >= startOfToday - dayMs) groups[1].posts.push(p);
      else if (t >= startOfToday - 6 * dayMs) groups[2].posts.push(p);
      else groups[3].posts.push(p);
    });
    return groups.filter((g) => g.posts.length > 0);
  }, [posts]);

  const stats = useMemo(() => {
    const list = posts ?? [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const today = list.filter((p) => new Date(p.createdAt).getTime() >= startOfToday).length;
    const week = list.filter((p) => new Date(p.createdAt).getTime() >= weekAgo).length;
    const cats = new Map<string, number>();
    list.forEach((p) => cats.set(p.category[0], (cats.get(p.category[0]) ?? 0) + 1));
    return { today, week, cats };
  }, [posts]);

  return (
    <AppShell
      right={
        <>
          <PanelCard>
            <PanelHeader title="Aktivitás" />
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard icon={Clock} value={stats.today} label="Új téma ma" />
              <StatCard icon={CalendarDays} value={stats.week} label="Ezen a héten" />
            </div>
          </PanelCard>

          <PanelCard>
            <PanelHeader title="Kategóriák" />
            <div className="flex flex-wrap gap-2">
              {[...stats.cats.entries()].map(([cat, n]) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card-2 px-3 py-1.5 text-sm text-fg-soft"
                >
                  <Hash size={13} className="text-accent-soft" />
                  {cat}
                  <span className="text-xs text-muted">{n}</span>
                </span>
              ))}
              {stats.cats.size === 0 && <p className="text-sm text-muted">Még nincs adat.</p>}
            </div>
          </PanelCard>

          {/* Globális hangulat – dekoráció (mock adat, lásd data/trends.ts) */}
          <SentimentGauge />
        </>
      }
    >
      <PageHeader
        icon={Clock}
        title="Friss"
        subtitle="A legújabb témák időrendben – itt mindig a legutóbbi beszélgetéseket látod"
      />

      {loading ? (
        <>
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : buckets.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Clock size={28} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Még nincs egyetlen téma sem.</p>
          <Link
            href="/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            <Plus size={15} />
            Legyél az első!
          </Link>
        </div>
      ) : (
        buckets.map((bucket) => (
          <section key={bucket.label}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-fg">{bucket.label}</h2>
              <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 text-xs font-semibold text-accent-soft">
                {bucket.posts.length}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <div className="space-y-3">
              {bucket.posts.map((p) => (
                <PostCompactCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        ))
      )}
    </AppShell>
  );
}
