import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Feed } from '@/components/Feed';
import { TrendPanel } from '@/components/TrendPanel';
import { CommunityMap } from '@/components/CommunityMap';
import { SentimentGauge } from '@/components/SentimentGauge';
import { FavoriteTopics } from '@/components/FavoriteTopics';
import { PreferencesProvider } from '@/components/PreferencesProvider';

export default function HomePage() {
  return (
    <PreferencesProvider>
      <div className="min-h-screen">
        {/* Bal sidebar – fix pozícióban, kivéve a folyamból */}
        <div className="fixed left-0 top-0 z-40 hidden h-screen w-60 border-r border-line bg-bg-elevated lg:block">
          <Sidebar />
        </div>

        {/* Fő terület – a sidebar szélességének megfelelő bal padding */}
        <div className="lg:pl-60">
          <Topbar />

          <div className="mx-auto flex max-w-[1380px] justify-center gap-6 px-4 py-6 sm:px-6">
            {/* Középső feed (egyéni hírfolyam szerint szűrve) */}
            <Feed />

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
    </PreferencesProvider>
  );
}
