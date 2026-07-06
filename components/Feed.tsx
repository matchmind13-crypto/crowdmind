'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rss, Inbox, Plus, RefreshCw } from 'lucide-react';
import { PostCard } from './PostCard';
import { usePreferences } from './PreferencesProvider';
import { fetchFeedPosts } from '@/lib/postsDb';
import type { FeedPost } from '@/data/types';

export function Feed() {
  const { preferred } = usePreferences();
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedPosts()
      .then(setPosts)
      .catch((e) => { setError(e instanceof Error ? e.message : 'Hiba a betöltéskor'); setPosts([]); });
  }, []);

  // Egyéni hírfolyam: a fő kategória (category[0]) alapján szűrünk.
  const visible = posts
    ? preferred
      ? posts.filter((p) => preferred.includes(p.category[0]))
      : posts
    : null;

  return (
    <main className="w-full max-w-[880px] space-y-5">
      {preferred && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/25 bg-accent-strong/10 px-4 py-2.5 text-sm">
          <Rss size={15} className="text-accent-soft" />
          <span className="font-medium text-fg-soft">Egyéni hírfolyam:</span>
          <span className="text-muted">{preferred.join(' · ')}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-sm text-fg-soft">
          <RefreshCw size={15} className="text-negative" />
          Nem sikerült betölteni a posztokat: {error}
        </div>
      )}

      {visible === null ? (
        // Betöltés alatti csontváz
        <>
          <div className="h-64 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-64 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">
            {preferred ? 'Nincs poszt a kiválasztott kategóriákban.' : 'Még nincs egyetlen téma sem.'}
          </p>
          <Link
            href="/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            <Plus size={15} />
            Hozd létre az első témát
          </Link>
        </div>
      ) : (
        visible.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </main>
  );
}
