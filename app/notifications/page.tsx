'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, MessagesSquare, ThumbsUp, CheckCheck, LogIn, FileText } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { StatCard } from '@/components/StatCard';
import { fetchNotifications, markAllNotificationsRead, fetchMyEngagement } from '@/lib/postsDb';
import type { NotificationItem } from '@/data/types';

/**
 * Értesítések – VALÓDI adat a notifications táblából.
 * Értesítés akkor keletkezik, amikor valaki hozzászól vagy szavaz a témádra
 * (lásd lib/postsDb.ts: notifyPostOwner).
 */
export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[] | null | 'anon'>(null);
  const [engagement, setEngagement] = useState<{ myPosts: number; commentsReceived: number; votesReceived: number } | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchNotifications()
      .then((n) => setItems(n === null ? 'anon' : n))
      .catch(() => setItems([]));
    fetchMyEngagement().then(setEngagement).catch(() => {});
  }, []);

  async function markAll() {
    if (marking || !Array.isArray(items)) return;
    setMarking(true);
    await markAllNotificationsRead();
    setItems(items.map((n) => ({ ...n, read: true })));
    setMarking(false);
  }

  const unreadCount = Array.isArray(items) ? items.filter((n) => !n.read).length : 0;

  return (
    <AppShell
      right={
        <>
          <PanelCard>
            <PanelHeader title="Aktivitásod" />
            {engagement ? (
              <div className="space-y-2.5">
                <StatCard icon={FileText} value={engagement.myPosts} label="Témád összesen" />
                <StatCard icon={MessagesSquare} value={engagement.commentsReceived} label="Kapott hozzászólás" />
                <StatCard icon={ThumbsUp} value={engagement.votesReceived} label="Kapott szavazat" />
              </div>
            ) : (
              <p className="px-1 text-sm text-muted">Jelentkezz be az aktivitásod megtekintéséhez.</p>
            )}
          </PanelCard>

          <PanelCard>
            <PanelHeader title="Miről értesítünk?" />
            <ul className="space-y-2 px-1 text-sm text-muted">
              <li className="flex gap-2">
                <MessagesSquare size={15} className="mt-0.5 shrink-0 text-accent-soft" />
                Ha valaki hozzászól a témádhoz
              </li>
              <li className="flex gap-2">
                <ThumbsUp size={15} className="mt-0.5 shrink-0 text-accent-soft" />
                Ha új szavazat érkezik a témádra
              </li>
            </ul>
          </PanelCard>
        </>
      }
    >
      <PageHeader
        icon={Bell}
        title="Értesítések"
        subtitle="Ami a témáid körül történt: hozzászólások és szavazatok"
        action={
          Array.isArray(items) && unreadCount > 0 ? (
            <button
              onClick={() => void markAll()}
              disabled={marking}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-card-2 px-3.5 py-2 text-sm font-medium text-fg-soft transition-colors hover:bg-hover disabled:opacity-50"
            >
              <CheckCheck size={15} className="text-accent-soft" />
              Mind olvasott
            </button>
          ) : undefined
        }
      />

      {items === null ? (
        <>
          <div className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : items === 'anon' ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <LogIn size={28} className="mx-auto mb-3 text-accent-soft" />
          <p className="text-sm text-fg-soft">Az értesítéseidhez jelentkezz be.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            Bejelentkezés
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Bell size={28} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Még nincs értesítésed.</p>
          <p className="mt-1 text-xs text-muted">
            Amint valaki hozzászól vagy szavaz a témáidra, itt fogod látni.
          </p>
          <Link
            href="/create"
            className="mt-4 inline-block rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            Indíts egy témát
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="divide-y divide-line">
            {items.map((n) => {
              const Icon = n.message.includes('hozzászólt')
                ? MessagesSquare
                : n.message.includes('szavazat')
                  ? ThumbsUp
                  : Bell;
              const inner = (
                <div className={`flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-hover/40 ${n.read ? '' : 'bg-accent-strong/5'}`}>
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${n.read ? 'bg-card-2 text-muted' : 'bg-accent-strong/20 text-accent-soft'}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-relaxed ${n.read ? 'text-fg-soft' : 'font-medium text-fg'}`}>
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{n.ago}</p>
                  </div>
                  {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                </div>
              );
              return n.postId ? (
                <Link key={n.id} href={`/post/${n.postId}`} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
