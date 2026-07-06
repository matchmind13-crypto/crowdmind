import { AppShell } from '@/components/AppShell';
import { Feed } from '@/components/Feed';
import { TrendPanel } from '@/components/TrendPanel';
import { CommunityMap } from '@/components/CommunityMap';
import { SentimentGauge } from '@/components/SentimentGauge';
import { FavoriteTopics } from '@/components/FavoriteTopics';

export default function HomePage() {
  return (
    <AppShell
      right={
        <>
          <TrendPanel />
          <CommunityMap />
          <SentimentGauge />
          <FavoriteTopics />
        </>
      }
    >
      <Feed />
    </AppShell>
  );
}
