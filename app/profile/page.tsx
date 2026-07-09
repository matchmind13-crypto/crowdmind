'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User as UserIcon, LogIn, LogOut, FileText, MessagesSquare, ThumbsUp, Pencil, Check, X, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { StatCard } from '@/components/StatCard';
import { PostCompactCard } from '@/components/PostCompactCard';
import { AccountDataPanel } from '@/components/AccountDataPanel';
import { PasswordChanger } from '@/components/PasswordChanger';
import { useAuth } from '@/lib/useAuth';
import { usePosts } from '@/lib/usePosts';
import { supabase } from '@/lib/supabase';

/** Profil – saját adatok, statisztikák, témák; felhasználónév-módosítás. Valódi adat. */
export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const { posts } = usePosts();
  const [myComments, setMyComments] = useState<number | null>(null);
  const [myVotes, setMyVotes] = useState<number | null>(null);

  // Saját aktivitás betöltése (valódi számok az adatbázisból)
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [c, v] = await Promise.all([
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      if (active) {
        setMyComments(c.count ?? 0);
        setMyVotes(v.count ?? 0);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const myPosts = (posts ?? []).filter((p) => p.authorId === user?.id);

  if (!loading && !user) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <LogIn size={26} className="mx-auto mb-3 text-accent-soft" />
          <p className="text-sm text-fg-soft">A profilod megtekintéséhez jelentkezz be.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            Bejelentkezés
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
            <PanelHeader title="Fiók" />
            <div className="space-y-2 px-1 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-muted">Email</span>
                <span className="truncate text-fg-soft">{user?.email ?? '—'}</span>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-muted">Felhasználónév</span>
                <span className="text-fg-soft">{user?.username ?? 'nincs beállítva'}</span>
              </p>
            </div>
            <button
              onClick={() => void signOut()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-negative/40 bg-negative/10 py-2.5 text-sm font-semibold text-negative transition-colors hover:bg-negative/20"
            >
              <LogOut size={15} />
              Kijelentkezés
            </button>
          </PanelCard>

          <PanelCard>
            <PanelHeader title="Egyéni hírfolyam" action="Kezelés" actionHref="/following" />
            <p className="px-1 text-sm leading-relaxed text-muted">
              A követett kategóriáidat a Követett oldalon vagy a bal oldali sáv Szerkesztés gombjával
              módosíthatod.
            </p>
          </PanelCard>

          {user && <AccountDataPanel />}
        </>
      }
    >
      <PageHeader
        icon={UserIcon}
        title={loading ? 'Betöltés…' : (user?.username ?? 'Profil')}
        subtitle="A fiókod, aktivitásod és a témáid egy helyen"
      />

      {/* Felhasználónév-szerkesztő */}
      {user && <UsernameEditor currentUsername={user.username} userId={user.id} />}

      {/* Jelszó módosítása */}
      {user && <PasswordChanger />}

      {/* Statisztikák (valódi adat) */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={FileText} value={posts ? myPosts.length : '…'} label="Témáid" />
        <StatCard icon={MessagesSquare} value={myComments ?? '…'} label="Hozzászólásod" />
        <StatCard icon={ThumbsUp} value={myVotes ?? '…'} label="Leadott szavazatod" />
      </div>

      {/* Saját témák */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-fg">Témáid</h2>
          <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 text-xs font-semibold text-accent-soft">
            {myPosts.length}
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>
        {myPosts.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-8 text-center">
            <p className="text-sm text-fg-soft">Még nem indítottál témát.</p>
            <Link
              href="/create"
              className="mt-3 inline-block rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
            >
              Indítsd el az elsőt!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myPosts.map((p) => (
              <PostCompactCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

/** Felhasználónév módosítása – valós idejű foglaltság-ellenőrzéssel, saját sorra (RLS védi). */
function UsernameEditor({ currentUsername, userId }: { currentUsername: string | null; userId: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentUsername ?? '');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    if (value === currentUsername) { setStatus('idle'); return; }
    if (value.length < 3) { setStatus('invalid'); return; }
    setStatus('checking');
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('user_id').eq('username', value).maybeSingle();
      setStatus(data ? 'taken' : 'available');
    }, 400);
    return () => clearTimeout(t);
  }, [value, editing, currentUsername]);

  async function save() {
    if (status !== 'available' || saving) return;
    setSaving(true);
    setError('');
    const { error } = await (supabase.from('profiles') as any)
      .update({ username: value })
      .eq('user_id', userId);
    if (error) {
      setError(error.code === '23505' ? 'Ez a név közben foglalt lett.' : error.message);
      setSaving(false);
      return;
    }
    window.location.reload();
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Felhasználónév</p>
          <p className="text-base font-semibold text-fg">{currentUsername ?? 'nincs beállítva'}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card-2 px-3.5 py-2 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
        >
          <Pencil size={14} className="text-accent-soft" />
          Módosítás
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Új felhasználónév</p>
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
          className="min-w-0 flex-1 rounded-xl border bg-bg-elevated px-4 py-2.5 text-sm text-fg focus:outline-none"
          style={{
            borderColor:
              status === 'available' ? 'var(--color-positive)'
              : (status === 'taken' || status === 'invalid') ? 'var(--color-negative)'
              : 'var(--color-line)',
          }}
        />
        <button
          onClick={() => void save()}
          disabled={status !== 'available' || saving}
          className="grid h-10 w-10 place-items-center rounded-xl bg-accent-strong text-white transition-colors hover:bg-accent disabled:opacity-50"
          aria-label="Mentés"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        </button>
        <button
          onClick={() => { setEditing(false); setValue(currentUsername ?? ''); setError(''); }}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card-2 text-muted transition-colors hover:bg-hover"
          aria-label="Mégse"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-1.5 min-h-4 text-xs">
        {status === 'checking' && <span className="text-muted">Ellenőrzés…</span>}
        {status === 'available' && <span className="text-positive">✓ Szabad</span>}
        {status === 'taken' && <span className="text-negative">✗ Foglalt</span>}
        {status === 'invalid' && <span className="text-negative">Legalább 3 karakter (kisbetű, szám, _)</span>}
        {error && <span className="text-negative"> {error}</span>}
      </p>
    </div>
  );
}
