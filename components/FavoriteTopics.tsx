'use client';
import Link from 'next/link';
import { Hash } from 'lucide-react';
import { usePosts } from '@/lib/usePosts';
import { usePreferences } from './PreferencesProvider';
import { PanelCard, PanelHeader } from './PanelCard';

/**
 * Kedvenc témáid mini-panel – VALÓDI adat:
 * - ha van egyéni hírfolyamod, a követett kategóriáid jelennek meg,
 * - egyébként a legtöbb témát tartalmazó kategóriák (az adatbázisból).
 */
export function FavoriteTopics() {
  const { preferred } = usePreferences();
  const { posts } = usePosts();

  const topCategories = (() => {
    const m = new Map<string, number>();
    (posts ?? []).forEach((p) => m.set(p.category[0], (m.get(p.category[0]) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);
  })();

  const items = preferred && preferred.length > 0 ? preferred : topCategories;
  const title = preferred && preferred.length > 0 ? 'Kedvenc témáid' : 'Népszerű kategóriák';

  return (
    <PanelCard>
      <PanelHeader title={title} action="Kezelés" actionHref="/following" />
      {items.length === 0 ? (
        <p className="px-1 text-sm text-muted">Még nincs adat.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((topic) => (
            <Link
              key={topic}
              href="/following"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card-2 px-3 py-1.5 text-sm text-fg-soft transition-colors hover:border-accent/40 hover:bg-hover"
            >
              <Hash size={13} className="text-accent-soft" />
              {topic}
            </Link>
          ))}
        </div>
      )}
    </PanelCard>
  );
}
