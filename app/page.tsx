import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { PostCard } from '@/components/PostCard';
import { TrendPanel } from '@/components/TrendPanel';
import { CommunityMap } from '@/components/CommunityMap';
import { SentimentGauge } from '@/components/SentimentGauge';
import { FavoriteTopics } from '@/components/FavoriteTopics';
import { posts } from '@/data/posts';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Bal sidebar – fix pozícióban, kivéve a folyamból */}
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-60 border-r border-line bg-bg-elevated lg:block">
        <Sidebar />
      </div>

      {/* Fő terület – a sidebar szélességének megfelelő bal padding */}
      <div className="lg:pl-60">
        <Topbar />

        <div className="mx-auto flex max-w-[1380px] justify-center gap-6 px-4 py-6 sm:px-6">
          {/* Középső feed */}
          <main className="w-full max-w-[880px] space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </main>

          {/* Jobb oldali panel */}
          <aside className="hidden w-[360px] shrink-0 space-y-5 xl:block">
            <TrendPanel />
            <CommunityMap />
            <SentimentGauge />
            <FavoriteTopics />
          </aside>
        </div>
      </div>
    </div>
  );
}
