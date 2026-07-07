'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Info, Layers, Compass } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PostCompactCard } from '@/components/PostCompactCard';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { StatCard } from '@/components/StatCard';
import { usePosts } from '@/lib/usePosts';
import { getSavedIds } from '@/lib/savedPosts';

/**
 * Mentett – a felhasználó által elmentett posztok.
 * Bejelentkezve a fiókhoz kötve (saved_posts tábla, minden eszközön);
 * kijelentkezve vagy a tábla hiányában localStorage-fallback.
 */
export default function SavedPage() {
  const { posts, loading } = usePosts();
  const [savedIds, setSavedIds] = useState<number[]>([]);
  useEffect(() => {
    let active = true;
    void getSavedIds().then((ids) => { if (active) setSavedIds(ids); });
    return () => { active = false; };
  }, []);

  const saved = useMemo(
    () => (posts ?? []).filter((p) => savedIds.includes(p.id)),
    [posts, savedIds],
  );

  const catBreakdown = useMemo(() => {
    const m = new Map<string, number>();
    saved.forEach((p) => m.set(p.category[0], (m.get(p.category[0]) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [saved]);

  return (
    <AppShell
      right={
        <>
          <PanelCard>
            <PanelHeader title="Mentéseid" />
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard icon={Bookmark} value={saved.length} label="Mentett téma" />
              <StatCard icon={Layers} value={catBreakdown.length} label="Kategória" />
            </div>
            {catBreakdown.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {catBreakdown.map(([cat, n]) => (
                  <div key={cat} className="flex items-center justify-between rounded-lg bg-card-2 px-3 py-1.5 text-sm">
                    <span className="text-fg-soft">{cat}</span>
                    <span className="text-xs font-semibold text-muted">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <PanelHeader title="Jó tudni" />
            <p className="flex gap-2 px-1 text-sm leading-relaxed text-muted">
              <Info size={15} className="mt-0.5 shrink-0 text-accent-soft" />
              Bejelentkezve a mentéseid a fiókodhoz kötődnek, így minden eszközödön
              ugyanazok. Kijelentkezve csak ebben a böngészőben élnek.
            </p>
          </PanelCard>
        </>
      }
    >
      <PageHeader
        icon={Bookmark}
        title="Mentett"
        subtitle="Témák, amiket félretettél későbbre – a poszt Mentés gombjával bővítheted"
      />

      {loading ? (
        <>
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : saved.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Bookmark size={28} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Még nincs mentett témád.</p>
          <p className="mt-1 text-xs text-muted">
            A posztok jobb felső sarkában lévő „Mentés” gombbal tehetsz félre témákat.
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            <Compass size={15} />
            Témák felfedezése
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((p) => (
            <PostCompactCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
