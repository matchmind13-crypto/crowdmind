'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User as UserIcon, UserX, FileText, MessagesSquare, ThumbsUp, CalendarDays, Plus, Sprout, Sparkles, Award } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { StatCard } from '@/components/StatCard';
import { PostCompactCard } from '@/components/PostCompactCard';
import { CredibilityBadge } from '@/components/CredibilityBadge';
import { usePosts } from '@/lib/usePosts';
import { supabase } from '@/lib/supabase';

interface ProfileInfo {
  userId: string;
  username: string;
}

/** Publikus profil-nézet: bárki megnézheti bárki témáit és aktivitását. */
export function UserProfileView({ username }: { username: string }) {
  const { posts } = usePosts();
  // undefined = töltés, null = nincs ilyen profil
  const [profile, setProfile] = useState<ProfileInfo | null | undefined>(undefined);
  const [commentsCount, setCommentsCount] = useState<number | null>(null);
  const [votesCount, setVotesCount] = useState<number | null>(null);
  const [firstActivity, setFirstActivity] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id,username')
        .eq('username', username)
        .maybeSingle();
      if (!active) return;
      if (!data) { setProfile(null); return; }
      setProfile({ userId: (data as any).user_id, username: (data as any).username });
    })();
    return () => { active = false; };
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const [c, v, firstComment] = await Promise.all([
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', profile.userId),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('user_id', profile.userId),
        supabase.from('comments').select('created_at').eq('user_id', profile.userId).order('created_at', { ascending: true }).limit(1),
      ]);
      if (!active) return;
      setCommentsCount(c.count ?? 0);
      setVotesCount(v.count ?? 0);
      const firstCommentAt = ((firstComment.data ?? []) as any[])[0]?.created_at as string | undefined;
      setFirstActivity(firstCommentAt ?? null);
    })();
    return () => { active = false; };
  }, [profile]);

  const userPosts = profile
    ? (posts ?? []).filter((p) => p.authorId === profile.userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  // Első aktivitás: a legkorábbi poszt vagy komment dátuma.
  const earliestPost = userPosts.length > 0 ? userPosts[userPosts.length - 1].createdAt : null;
  const firstSeen = [earliestPost, firstActivity].filter(Boolean).sort()[0] ?? null;

  const contributions = userPosts.length + (commentsCount ?? 0);

  if (profile === null) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <UserX size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Ez a profil nem található.</p>
          <p className="mt-1 text-xs text-muted">Lehet, hogy a felhasználó nevet váltott, vagy törölte a fiókját.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
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
            <PanelHeader title="Hitelesség-szintek" />
            <div className="space-y-2.5 px-1 text-sm">
              <p className="flex items-center gap-2">
                <Sprout size={15} className="shrink-0 text-positive" />
                <span className="text-fg-soft">Új tag</span>
                <span className="ml-auto text-xs text-muted">4 alatt</span>
              </p>
              <p className="flex items-center gap-2">
                <Sparkles size={15} className="shrink-0 text-accent-soft" />
                <span className="text-fg-soft">Aktív tag</span>
                <span className="ml-auto text-xs text-muted">4+ hozzájárulás</span>
              </p>
              <p className="flex items-center gap-2">
                <Award size={15} className="shrink-0 text-amber-400" />
                <span className="text-fg-soft">Törzstag</span>
                <span className="ml-auto text-xs text-muted">15+ hozzájárulás</span>
              </p>
              <p className="border-t border-line pt-2.5 text-xs leading-relaxed text-muted">
                A szint a valódi aktivitásból számolódik: elindított témák + hozzászólások.
              </p>
            </div>
          </PanelCard>

          <PanelCard>
            <PanelHeader title="Építs te is hitelességet" />
            <p className="px-1 text-sm leading-relaxed text-muted">
              Indíts témát vagy szólj hozzá a vitákhoz — minden hozzájárulás számít a jelvényedbe.
            </p>
            <Link
              href="/create"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-strong py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
            >
              <Plus size={15} />
              Új téma indítása
            </Link>
          </PanelCard>
        </>
      }
    >
      {profile === undefined ? (
        <>
          <div className="h-28 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-24 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : (
        <>
          {/* Profil-fejléc */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent-strong/15 text-accent-soft ring-1 ring-accent/25">
              <UserIcon size={28} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-fg">{profile.username}</h1>
                {commentsCount !== null && <CredibilityBadge contributions={contributions} />}
              </div>
              {firstSeen && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <CalendarDays size={13} />
                  Első aktivitás: {new Date(firstSeen).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Statisztikák */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={FileText} value={posts ? userPosts.length : '…'} label="Témája" />
            <StatCard icon={MessagesSquare} value={commentsCount ?? '…'} label="Hozzászólása" />
            <StatCard icon={ThumbsUp} value={votesCount ?? '…'} label="Leadott szavazata" />
          </div>

          {/* Témái */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-fg">Témái</h2>
              <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 text-xs font-semibold text-accent-soft">
                {userPosts.length}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
            {userPosts.length === 0 ? (
              <div className="rounded-2xl border border-line bg-card p-8 text-center">
                <p className="text-sm text-fg-soft">
                  {profile.username} még nem indított témát — de a hozzászólásaival és szavazataival már formálja a közösséget.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map((p) => (
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
