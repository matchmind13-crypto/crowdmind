'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Pencil, LogIn, Rss, Plus, ChevronRight, Bell } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PostCompactCard } from '@/components/PostCompactCard';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { CategoryPickerModal } from '@/components/CategoryPickerModal';
import { usePreferences } from '@/components/PreferencesProvider';
import { usePosts } from '@/lib/usePosts';
import { fetchFollowedPostIds } from '@/lib/postFollows';
import { CATEGORIES } from '@/lib/categories';

/**
 * Követett – az Egyéni hírfolyamban követett kategóriák gyűjtőoldala,
 * kategóriánként csoportosítva. Valódi adat: a követés a profiles.preferred_categories
 * oszlopból, a posztok az adatbázisból jönnek.
 */
export default function FollowingPage() {
  return (
    <AppShell right={<RightRail />}>
      <FollowingContent />
    </AppShell>
  );
}

function FollowingContent() {
  const { userId, preferred, loading: prefLoading } = usePreferences();
  const { posts, loading } = usePosts();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [followedIds, setFollowedIds] = useState<number[] | null>(null);

  useEffect(() => {
    let active = true;
    void fetchFollowedPostIds().then((ids) => { if (active) setFollowedIds(ids); });
    return () => { active = false; };
  }, [userId]);

  // A követett témák a követés sorrendjében (legutóbb követett elöl).
  const followedPosts = useMemo(() => {
    if (!followedIds || !posts) return [];
    return followedIds
      .map((id) => posts.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [followedIds, posts]);

  const sections = useMemo(() => {
    if (!preferred) return [];
    return preferred.map((cat) => ({
      cat,
      icon: CATEGORIES.find((c) => c.name === cat)?.icon ?? Rss,
      posts: (posts ?? []).filter((p) => p.category[0] === cat),
    }));
  }, [preferred, posts]);

  return (
    <>
      <PageHeader
        icon={Users}
        title="Követett"
        subtitle="A követett kategóriáid legújabb témái egy helyen"
        action={
          userId ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-card-2 px-3.5 py-2 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
            >
              <Pencil size={14} className="text-accent-soft" />
              Kezelés
            </button>
          ) : undefined
        }
      />

      {prefLoading || loading ? (
        <>
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : !userId ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <LogIn size={28} className="mx-auto mb-3 text-accent-soft" />
          <p className="text-sm text-fg-soft">A követett témákhoz jelentkezz be.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            Bejelentkezés
          </Link>
        </div>
      ) : (
        <>
          {/* Követett témák — harang ikonnal követett konkrét posztok */}
          {followedPosts.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-strong/15 text-accent-soft">
                  <Bell size={16} />
                </span>
                <h2 className="text-base font-bold text-fg">Követett témák</h2>
                <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 text-xs font-semibold text-accent-soft">
                  {followedPosts.length} téma
                </span>
                <div className="h-px flex-1 bg-line" />
              </div>
              <p className="mb-3 px-1 text-xs text-muted">
                Ezekről a témákról minden új hozzászólásnál értesítést kapsz.
              </p>
              <div className="space-y-3">
                {followedPosts.map((p) => (
                  <PostCompactCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}

          {!preferred || preferred.length === 0 ? (
            <div className="rounded-2xl border border-line bg-card p-10 text-center">
              <Rss size={28} className="mx-auto mb-3 text-accent-soft" />
              <p className="text-sm text-fg-soft">Még nem követsz egyetlen kategóriát sem.</p>
              <p className="mt-1 text-xs text-muted">Válaszd ki, mely témák érdekelnek, és itt gyűjtjük őket neked.</p>
              <button
                onClick={() => setPickerOpen(true)}
                className="mt-4 rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
              >
                Kategóriák kiválasztása
              </button>
            </div>
          ) : (
            sections.map(({ cat, icon: Icon, posts: catPosts }) => (
          <section key={cat}>
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-strong/15 text-accent-soft">
                <Icon size={16} />
              </span>
              <h2 className="text-base font-bold text-fg">{cat}</h2>
              <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 text-xs font-semibold text-accent-soft">
                {catPosts.length} téma
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {catPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-5 text-center">
                <p className="text-sm text-muted">Ebben a kategóriában még nincs téma.</p>
                <Link
                  href="/create"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent-soft hover:text-accent"
                >
                  <Plus size={14} />
                  Indíts egyet
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {catPosts.slice(0, 3).map((p) => (
                  <PostCompactCard key={p.id} post={p} />
                ))}
                {catPosts.length > 3 && (
                  <Link
                    href="/discover"
                    className="flex items-center justify-center gap-1 rounded-xl border border-line bg-card py-2.5 text-sm font-medium text-accent-soft transition-colors hover:bg-hover"
                  >
                    Mind a {catPosts.length} téma megtekintése
                    <ChevronRight size={15} />
                  </Link>
                )}
              </div>
            )}
          </section>
            ))
          )}
        </>
      )}

      {pickerOpen && <CategoryPickerModal onClose={() => setPickerOpen(false)} />}
    </>
  );
}

function RightRail() {
  const { userId, preferred, save } = usePreferences();
  const { posts } = usePosts();
  const [busy, setBusy] = useState<string | null>(null);

  // Ajánlott (még nem követett) kategóriák valódi téma-számmal
  const suggestions = CATEGORIES
    .filter((c) => !(preferred ?? []).includes(c.name))
    .map((c) => ({
      ...c,
      count: (posts ?? []).filter((p) => p.category[0] === c.name).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  async function follow(name: string) {
    if (!userId || busy) return;
    setBusy(name);
    await save([...(preferred ?? []), name]);
    setBusy(null);
  }

  return (
    <>
      <PanelCard>
        <PanelHeader title="Ajánlott kategóriák" />
        {suggestions.length === 0 ? (
          <p className="px-1 text-sm text-muted">Már minden kategóriát követsz. 🎉</p>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="flex items-center gap-3 rounded-xl border border-line bg-card-2 px-3 py-2.5">
                  <Icon size={16} className="shrink-0 text-accent-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg-soft">{s.name}</p>
                    <p className="text-xs text-muted">{s.count} téma</p>
                  </div>
                  <button
                    onClick={() => void follow(s.name)}
                    disabled={!userId || busy === s.name}
                    className="shrink-0 rounded-lg bg-accent-strong/15 px-2.5 py-1 text-xs font-semibold text-accent-soft transition-colors hover:bg-accent-strong/25 disabled:opacity-50"
                  >
                    {busy === s.name ? '…' : 'Követés'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </PanelCard>

      <PanelCard>
        <PanelHeader title="Tipp" />
        <p className="px-1 text-sm leading-relaxed text-muted">
          A követett kategóriáid az <span className="text-fg-soft">Egyéni hírfolyamodat</span> is
          alakítják: a Kezdőlapon is ezek a témák jelennek meg először.
        </p>
      </PanelCard>
    </>
  );
}
