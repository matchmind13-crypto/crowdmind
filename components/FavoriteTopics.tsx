import { Hash } from 'lucide-react';
import { favoriteTopics } from '@/data/trends';
import { PanelCard, PanelHeader } from './PanelCard';

export function FavoriteTopics() {
  return (
    <PanelCard>
      <PanelHeader title="Kedvenc témáid" />
      <div className="flex flex-wrap gap-2">
        {favoriteTopics.map((topic) => (
          <button
            key={topic}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card-2 px-3 py-1.5 text-sm text-fg-soft transition-colors hover:border-accent/40 hover:bg-hover"
          >
            <Hash size={13} className="text-accent-soft" />
            {topic}
          </button>
        ))}
      </div>
    </PanelCard>
  );
}
