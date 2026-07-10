import { AppShell } from '@/components/AppShell';
import { Feed } from '@/components/Feed';
import { TrendPanel } from '@/components/TrendPanel';
import { LeaderboardPanel } from '@/components/LeaderboardPanel';
import { SentimentGauge } from '@/components/SentimentGauge';
import { FavoriteTopics } from '@/components/FavoriteTopics';

export default function HomePage() {
  return (
    <AppShell
      right={
        <>
          <TrendPanel />
          <LeaderboardPanel />
          <SentimentGauge />
          <FavoriteTopics />
        </>
      }
    >
      <Feed />
    </AppShell>
  );
}
