'use client';
import { Rss, Inbox } from 'lucide-react';
import { posts } from '@/data/posts';
import { PostCard } from './PostCard';
import { usePreferences } from './PreferencesProvider';

export function Feed() {
  const { preferred } = usePreferences();

  // Ha van egyéni hírfolyam, a felső kategória (category[0]) alapján szűrünk.
  const visible = preferred
    ? posts.filter((p) => preferred.includes(p.category[0]))
    : posts;

  return (
    <main className="w-full max-w-[880px] space-y-5">
      {preferred && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/25 bg-accent-strong/10 px-4 py-2.5 text-sm">
          <Rss size={15} className="text-accent-soft" />
          <span className="font-medium text-fg-soft">Egyéni hírfolyam:</span>
          <span className="text-muted">{preferred.join(' · ')}</span>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Nincs poszt a kiválasztott kategóriákban.</p>
          <p className="mt-1 text-xs text-muted">Módosítsd az egyéni hírfolyamodat a bal oldali sávban.</p>
        </div>
      ) : (
        visible.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </main>
  );
}
