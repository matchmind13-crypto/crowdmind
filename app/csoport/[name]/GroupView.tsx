'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, UsersRound, CalendarDays, FileText, Plus, Check, Loader2, Inbox, ThumbsUp } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { StatCard } from '@/components/StatCard';
import { PostCompactCard } from '@/components/PostCompactCard';
import { UserBadge } from '@/components/UserBadge';
import { usePosts } from '@/lib/usePosts';
import { fetchGroupByName, isGroupMember, toggleGroupMembership, type GroupInfo } from '@/lib/groups';
import { supabase } from '@/lib/supabase';

/**
 * Valódi csoport oldala: név, leírás, NYILVÁNOS adatok (ki hozta létre, mikor,
 * hány tag), csatlakozás gomb és a csoport témái.
 */
export function GroupView({ name }: { name: string }) {
  const { posts, loading } = usePosts();
  // undefined = töltés, null = nincs ilyen csoport
  const [group, setGroup] = useState<GroupInfo | null | undefined>(undefined);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [member, setMember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [joinMsg, setJoinMsg] = useState<{ text: string; needsLogin?: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const g = await fetchGroupByName(name);
      if (!active) return;
      setGroup(g);
      if (!g) return;
      const [{ data: prof }, m] = await Promise.all([
        supabase.from('profiles').select('username').eq('user_id', g.creatorId).maybeSingle(),
        isGroupMember(g.id),
      ]);
      if (!active) return;
      setCreatorName(((prof as any)?.username as string | null) ?? 'ismeretlen');
      setMember(m);
    })();
    return () => { active = false; };
  }, [name]);

  const groupPosts = useMemo(
    () => (group ? (posts ?? []).filter((p) => p.groupId === group.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []),
    [posts, group],
  );
  const totalVotes = groupPosts.reduce((s, p) => s + p.yesVotes + p.noVotes + p.neutralVotes, 0);
  const [members, setMembers] = useState<number | null>(null);
  useEffect(() => { if (group) setMembers(group.members); }, [group]);

  async function toggleJoin() {
    if (busy || !group) return;
    setBusy(true);
    setJoinMsg(null);
    const res = await toggleGroupMembership(group.id);
    if (res.needsLogin) {
      setJoinMsg({ text: 'A csatlakozáshoz jelentkezz be.', needsLogin: true });
    } else if (res.unavailable) {
      setJoinMsg({ text: 'A csoportok hamarosan elérhetők.' });
    } else {
      setMember(res.member);
      setMembers((m) => (m === null ? m : Math.max(0, m + (res.member ? 1 : -1))));
      setJoinMsg({ text: res.member ? 'Csatlakoztál a csoporthoz! 🎉' : 'Kiléptél a csoportból.' });
    }
    setBusy(false);
  }

  if (group === null) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Ez a csoport nem található.</p>
          <Link href="/csoportok" className="mt-4 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Csoportok böngészése
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      right={
        group ? (
          <>
            <PanelCard>
              <PanelHeader title="A csoportról" />
              <div className="space-y-2.5 px-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted">
                    <UsersRound size={14} className="text-accent-soft" /> Létrehozta
                  </span>
                  {creatorName ? (
                    <UserBadge username={creatorName} size="sm" linkTo={`/user/${encodeURIComponent(creatorName)}`} />
                  ) : (
                    <span className="text-fg-soft">…</span>
                  )}
                </div>
                <p className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted">
                    <CalendarDays size={14} className="text-accent-soft" /> Létrehozva
                  </span>
                  <span className="font-medium text-fg-soft">
                    {new Date(group.createdAt).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Users size={14} className="text-accent-soft" /> Tagok
                  </span>
                  <span className="font-medium text-fg-soft">{members ?? group.members} fő</span>
                </p>
              </div>
            </PanelCard>

            <PanelCard>
              <PanelHeader title="Indíts témát itt" />
              <p className="px-1 text-sm leading-relaxed text-muted">
                Kérdezz vagy indíts vitát a(z) {group.name} csoportban.
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
        ) : undefined
      }
    >
      {group === undefined ? (
        <>
          <div className="h-28 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-24 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : (
        <>
          {/* Csoport-fejléc */}
          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent-strong/15 text-accent-soft ring-1 ring-accent/25">
                <UsersRound size={28} />
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-fg">{group.name}</h1>
                <p className="mt-0.5 text-sm text-muted">
                  {members ?? group.members} tag · {groupPosts.length} téma
                  {creatorName ? <> · létrehozta: <span className="text-fg-soft">{creatorName}</span></> : null}
                </p>
              </div>
              <button
                onClick={() => void toggleJoin()}
                disabled={busy}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  member
                    ? 'border border-line bg-card-2 text-fg-soft hover:bg-hover'
                    : 'bg-accent-strong text-white hover:bg-accent'
                }`}
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : member ? <Check size={15} className="text-positive" /> : <Plus size={15} />}
                {member ? 'Tag vagy' : 'Csatlakozom'}
              </button>
            </div>
            {group.description && (
              <p className="mt-3 text-sm leading-relaxed text-fg-soft">{group.description}</p>
            )}
            {joinMsg && (
              <p className="mt-2.5 text-xs text-accent-soft">
                {joinMsg.text}{' '}
                {joinMsg.needsLogin && (
                  <Link href="/login" className="font-semibold underline">Bejelentkezés</Link>
                )}
              </p>
            )}
          </div>

          {/* Statisztikák */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={FileText} value={loading ? '…' : groupPosts.length} label="Téma" />
            <StatCard icon={ThumbsUp} value={loading ? '…' : totalVotes} label="Szavazat" />
            <StatCard icon={Users} value={members ?? group.members} label="Tag" />
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
        </>
      )}
    </AppShell>
  );
}
