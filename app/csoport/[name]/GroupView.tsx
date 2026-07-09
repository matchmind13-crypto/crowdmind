'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, CalendarDays, FileText, Rss, Plus, Check, Loader2, Inbox, BadgeCheck, ThumbsUp } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { StatCard } from '@/components/StatCard';
import { PostCompactCard } from '@/components/PostCompactCard';
import { usePreferences } from '@/components/PreferencesProvider';
import { usePosts } from '@/lib/usePosts';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';

/**
 * Csoport-oldal: a kategória közösségi "otthona".
 * Nyilvános adatok: ki hozta létre, mióta aktív, hány tagja (követője) van.
 * A csatlakozás = a kategória felvétele az Egyéni hírfolyamba (preferred_categories).
 */
export function GroupView({ name }: { name: string }) {
  const { posts, loading } = usePosts();
  const { userId, preferred, save } = usePreferences();
  const [members, setMembers] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  const catMeta = CATEGORIES.find((c) => c.name === name);
  const Icon = catMeta?.icon ?? Rss;

  const groupPosts = useMemo(
    () => (posts ?? []).filter((p) => p.category[0] === name)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [posts, name],
  );
  const firstPostAt = groupPosts.length > 0 ? groupPosts[groupPosts.length - 1].createdAt : null;
  const totalVotes = groupPosts.reduce((s, p) => s + p.yesVotes + p.noVotes + p.neutralVotes, 0);
  const isMember = (preferred ?? []).includes(name);

  // Taglétszám: hányan követik ezt a kategóriát az Egyéni hírfolyamukban.
  useEffect(() => {
    let active = true;
    (async () => {
      const { count } = await supabase
        .from('profiles')
        .select('user_id', { count: 'exact', head: true })
        .contains('preferred_categories', [name]);
      if (active) setMembers(count ?? 0);
    })();
    return () => { active = false; };
  }, [name]);

  async function toggleJoin() {
    if (busy) return;
    if (!userId) {
      setJoinMsg('A csatlakozáshoz jelentkezz be.');
      return;
    }
    setBusy(true);
    setJoinMsg(null);
    const next = isMember
      ? (preferred ?? []).filter((c) => c !== name)
      : [...(preferred ?? []), name];
    await save(next);
    setMembers((m) => (m === null ? m : Math.max(0, m + (isMember ? -1 : 1))));
    setJoinMsg(isMember ? 'Kiléptél a csoportból.' : 'Csatlakoztál! A csoport témái az Egyéni hírfolyamodban is megjelennek. 🎉');
    setBusy(false);
  }

  const exists = !!catMeta || groupPosts.length > 0;

  if (!loading && !exists) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Ez a csoport nem található.</p>
          <Link href="/" className="mt-4 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Vissza a hírfolyamhoz
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      right={
        <>
          <PanelCard>
            <PanelHeader title="A csoportról" />
            <div className="space-y-2.5 px-1 text-sm">
              <p className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted"><BadgeCheck size={14} className="text-accent-soft" /> Létrehozta</span>
                <span className="font-medium text-fg-soft">CrowdMind</span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted"><CalendarDays size={14} className="text-accent-soft" /> Aktív</span>
                <span className="font-medium text-fg-soft">
                  {firstPostAt
                    ? `${new Date(firstPostAt).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })} óta`
                    : 'témára vár'}
                </span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted"><Users size={14} className="text-accent-soft" /> Tagok</span>
                <span className="font-medium text-fg-soft">{members ?? '…'} fő</span>
              </p>
              <p className="border-t border-line pt-2.5 text-xs leading-relaxed text-muted">
                Hivatalos CrowdMind-alapcsoport. A tagok az Egyéni hírfolyamukban követik a csoport
                témáit, és értesítést kapnak az újakról.
              </p>
            </div>
          </PanelCard>

          <PanelCard>
            <PanelHeader title="Indíts témát itt" />
            <p className="px-1 text-sm leading-relaxed text-muted">
              Kérdezz vagy indíts vitát a(z) {name} csoportban — a tagok értesítést kapnak róla.
            </p>
            <Link
              href="/create"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-strong py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
            >
              <Plus size={15} />
              Új téma
            </Link>
          </PanelCard>
        </>
      }
    >
      {/* Csoport-fejléc */}
      <div className="rounded-2xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent-strong/15 text-accent-soft ring-1 ring-accent/25">
            <Icon size={28} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-fg">{name}</h1>
            <p className="mt-0.5 text-sm text-muted">
              {members ?? '…'} tag · {groupPosts.length} téma · CrowdMind-alapcsoport
            </p>
          </div>
          <button
            onClick={() => void toggleJoin()}
            disabled={busy}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
              isMember
                ? 'border border-line bg-card-2 text-fg-soft hover:bg-hover'
                : 'bg-accent-strong text-white hover:bg-accent'
            }`}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : isMember ? <Check size={15} className="text-positive" /> : <Plus size={15} />}
            {isMember ? 'Tag vagy' : 'Csatlakozom'}
          </button>
        </div>
        {joinMsg && (
          <p className="mt-2.5 text-xs text-accent-soft">
            {joinMsg}{' '}
            {!userId && (
              <Link href="/login" className="font-semibold underline">Bejelentkezés</Link>
            )}
          </p>
        )}
      </div>

      {/* Statisztikák */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={FileText} value={loading ? '…' : groupPosts.length} label="Téma" />
        <StatCard icon={ThumbsUp} value={loading ? '…' : totalVotes} label="Szavazat" />
        <StatCard icon={Users} value={members ?? '…'} label="Tag" />
      </div>

      {/* Témák */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-fg">A csoport témái</h2>
          <div className="h-px flex-1 bg-line" />
        </div>
        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
        ) : groupPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center">
            <p className="text-sm text-muted">Ebben a csoportban még nincs téma — legyél az első!</p>
            <Link href="/create" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-soft hover:text-accent">
              <Plus size={14} /> Téma indítása
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groupPosts.map((p) => (
              <PostCompactCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
