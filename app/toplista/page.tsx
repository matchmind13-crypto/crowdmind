'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Medal, Target, Flame, User as UserIcon, Info } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { fetchLeaderboard, type Leaderboard } from '@/lib/leaderboard';

/**
 * Toplista – valódi adatból számolt rangsorok (a mock közösségi térkép utódja):
 * legjobb jósok a lezárt jóslatokból, legaktívabb tagok a posztok+kommentek alapján.
 */
export default function ToplistaPage() {
  return (
    <AppShell right={<RightRail />}>
      <ToplistaContent />
    </AppShell>
  );
}

function ToplistaContent() {
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchLeaderboard(10)
      .then((b) => { if (active) setBoard(b); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHeader
        icon={Medal}
        title="Toplista"
        subtitle="A közösség legjobbjai — valódi találatokból és valódi aktivitásból"
      />

      {error && (
        <div className="rounded-2xl border border-negative/30 bg-negative/10 p-4 text-sm text-fg-soft">
          Nem sikerült betölteni a toplistát — frissítsd az oldalt!
        </div>
      )}

      {!board && !error ? (
        <>
          <div className="h-64 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-64 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : board ? (
        <>
          {/* Legjobb jósok */}
          <section className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
                <Target size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-fg">Legjobb jósok</h2>
                <p className="text-xs text-muted">Találatok a lezárt jóslatokon — ezt nem lehet kamuzni</p>
              </div>
            </div>
            {board.predictors.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-fg-soft">Még senkinek nincs lezárt jóslat-találata.</p>
                <p className="mt-1 text-xs text-muted">
                  Tippelj a nyitott jóslatokra — az első találatod ide kerül!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {board.predictors.map((r, i) => (
                  <Link
                    key={r.userId}
                    href={`/user/${r.username}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-hover/40"
                  >
                    <RankBadge rank={i + 1} />
                    <Avatar url={r.avatarUrl} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
                      {r.username}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-400">
                      {r.hits}/{r.total} találat
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Legaktívabbak */}
          <section className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-strong/15 text-accent-soft">
                <Flame size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-fg">Legaktívabb tagok</h2>
                <p className="text-xs text-muted">Témák és hozzászólások alapján</p>
              </div>
            </div>
            {board.actives.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-fg-soft">Még nincs rangsorolható aktivitás.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {board.actives.map((r, i) => (
                  <Link
                    key={r.userId}
                    href={`/user/${r.username}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-hover/40"
                  >
                    <RankBadge rank={i + 1} />
                    <Avatar url={r.avatarUrl} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
                      {r.username}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {r.posts} téma · {r.comments} hozzászólás
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`w-8 shrink-0 text-center text-lg font-extrabold ${
        rank <= 3 ? 'text-accent-soft' : 'text-muted'
      }`}
    >
      {rank}
    </span>
  );
}

function Avatar({ url }: { url: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card-2 text-muted">
      <UserIcon size={15} />
    </span>
  );
}

function RightRail() {
  return (
    <PanelCard>
      <PanelHeader title="Hogyan kerülsz fel?" />
      <div className="space-y-3 px-1 text-sm leading-relaxed text-muted">
        <p className="flex gap-2">
          <Target size={15} className="mt-0.5 shrink-0 text-amber-400" />
          <span>
            <span className="font-semibold text-fg-soft">Legjobb jósok:</span> szavazz a 🎯
            jóslat-témákra — amikor egy jóslat eldől, a találatod ide (és a profilodra) kerül.
          </span>
        </p>
        <p className="flex gap-2">
          <Flame size={15} className="mt-0.5 shrink-0 text-accent-soft" />
          <span>
            <span className="font-semibold text-fg-soft">Legaktívabbak:</span> indíts témákat és
            szólj hozzá a vitákhoz — egy téma 2 pont, egy hozzászólás 1 pont.
          </span>
        </p>
        <p className="flex gap-2">
          <Info size={15} className="mt-0.5 shrink-0 text-muted" />
          <span>Minden szám valódi tevékenységből származik — a hivatalos fiók nem versenyez.</span>
        </p>
      </div>
    </PanelCard>
  );
}
