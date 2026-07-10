'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Flame, User as UserIcon } from 'lucide-react';
import { PanelCard, PanelHeader, PanelFooterLink } from './PanelCard';
import { fetchLeaderboard, type Leaderboard } from '@/lib/leaderboard';

/**
 * Toplista mini-panel a jobb sávba (a mock közösségi térkép utódja):
 * a legjobb jósok top 3-a — amíg nincs, a legaktívabb tagok.
 */
export function LeaderboardPanel() {
  const [board, setBoard] = useState<Leaderboard | null>(null);

  useEffect(() => {
    let active = true;
    fetchLeaderboard(3)
      .then((b) => { if (active) setBoard(b); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const showPredictors = (board?.predictors.length ?? 0) > 0;
  const rows = showPredictors ? board!.predictors : board?.actives ?? [];

  return (
    <PanelCard>
      <PanelHeader title={showPredictors ? 'Legjobb jósok' : 'Legaktívabb tagok'} />
      {board === null ? (
        <div className="h-24 animate-pulse rounded-xl bg-card-2" />
      ) : rows.length === 0 ? (
        <p className="px-1 text-sm text-muted">
          Tippelj a 🎯 jóslatokra — az első találat ide kerül!
        </p>
      ) : (
        <div className="space-y-1">
          {rows.map((r, i) => (
            <Link
              key={r.userId}
              href={`/user/${r.username}`}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-hover"
            >
              <span className={`w-4 shrink-0 text-center text-sm font-bold ${i === 0 ? 'text-accent-soft' : 'text-muted'}`}>
                {i + 1}
              </span>
              {r.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.avatarUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-card-2 text-muted">
                  <UserIcon size={13} />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg-soft">{r.username}</span>
              {showPredictors ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-400">
                  <Target size={12} />
                  {'hits' in r ? `${r.hits}/${r.total}` : ''}
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted">
                  <Flame size={12} className="text-accent-soft" />
                  {'score' in r ? r.score : ''} p
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
      <PanelFooterLink label="Teljes toplista" href="/toplista" />
    </PanelCard>
  );
}
