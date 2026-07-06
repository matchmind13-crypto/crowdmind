'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Bell, MessageSquare, ChevronDown, User as UserIcon, LogOut, UserCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { useUnreadCount } from '@/lib/useUnread';
import { SearchOverlay } from './SearchOverlay';

export function Topbar() {
  const { user, loading, signOut } = useAuth();
  const unread = useUnreadCount();
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K megnyitja a keresőt
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-bg/80 px-5 py-3 backdrop-blur-xl">
      {/* Kereső – kattintásra nyílik az overlay */}
      <button
        onClick={() => setSearchOpen(true)}
        className="relative hidden max-w-xl flex-1 md:block"
      >
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <span className="block w-full rounded-xl border border-line bg-card-2 py-2.5 pl-10 pr-16 text-left text-sm text-muted transition-colors hover:border-accent/40">
          Keresés témákra, kérdésekre, véleményekre…
        </span>
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-line bg-bg-elevated px-1.5 py-0.5 text-[11px] font-medium text-muted lg:flex">
          ⌘ K
        </kbd>
      </button>

      {/* Mobil kereső-ikon */}
      <button
        onClick={() => setSearchOpen(true)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-card-2 text-fg-soft transition-colors hover:bg-hover md:hidden"
        aria-label="Keresés"
      >
        <Search size={18} />
      </button>

      <div className="ml-auto flex items-center gap-2.5">
        <Link
          href="/create"
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Új téma</span>
        </Link>

        {/* Harang – a valódi olvasatlan értesítésszámmal, az Értesítések oldalra visz */}
        <Link
          href="/notifications"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-card-2 text-fg-soft transition-colors hover:bg-hover"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-negative px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>

        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-card-2 text-fg-soft transition-colors hover:bg-hover">
          <MessageSquare size={18} />
        </button>

        {/* Profil / auth */}
        {loading ? (
          <div className="h-10 w-28 animate-pulse rounded-xl border border-line bg-card-2" />
        ) : user ? (
          <ProfileMenu username={user.username ?? user.email ?? 'Profil'} onSignOut={signOut} />
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent-strong/15 px-3.5 py-2.5 text-sm font-semibold text-accent-soft transition-colors hover:bg-accent-strong/25"
          >
            <LogIn size={16} />
            Bejelentkezés
          </Link>
        )}
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

function ProfileMenu({ username, onSignOut }: { username: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-line bg-card-2 py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-hover"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-hover text-muted ring-1 ring-line">
          <UserIcon size={15} />
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-fg-soft sm:inline">{username}</span>
        <ChevronDown size={15} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-card-2 p-1 shadow-2xl shadow-black/50">
          <div className="border-b border-line px-3 py-2">
            <p className="text-xs text-muted">Bejelentkezve mint</p>
            <p className="truncate text-sm font-semibold text-fg">{username}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg-soft transition-colors hover:bg-hover"
          >
            <UserCircle size={16} className="text-muted" />
            Profilom
          </Link>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-negative transition-colors hover:bg-hover"
          >
            <LogOut size={16} />
            Kijelentkezés
          </button>
        </div>
      )}
    </div>
  );
}
