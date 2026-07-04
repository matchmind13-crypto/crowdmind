'use client';
import { Search, Plus, Bell, MessageSquare, ChevronDown, User as UserIcon } from 'lucide-react';
import { currentUser } from '@/data/users';

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-bg/80 px-5 py-3 backdrop-blur-xl">
      {/* Kereső */}
      <div className="relative hidden max-w-xl flex-1 md:block">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          placeholder="Keresés témákra, kérdésekre, véleményekre…"
          className="w-full rounded-xl border border-line bg-card-2 py-2.5 pl-10 pr-16 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-line bg-bg-elevated px-1.5 py-0.5 text-[11px] font-medium text-muted lg:flex">
          ⌘ K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
          <Plus size={16} />
          <span className="hidden sm:inline">Új téma</span>
        </button>

        <IconButton icon={Bell} badge={12} />
        <IconButton icon={MessageSquare} />

        {/* Profil */}
        <button className="flex items-center gap-2 rounded-xl border border-line bg-card-2 py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-hover">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-hover text-muted ring-1 ring-line">
            <UserIcon size={15} />
          </span>
          <span className="hidden text-sm font-medium text-fg-soft sm:inline">{currentUser.username}</span>
          {currentUser.pro && (
            <span className="rounded-md bg-gradient-to-r from-accent-strong to-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              Pro
            </span>
          )}
          <ChevronDown size={15} className="text-muted" />
        </button>
      </div>
    </header>
  );
}

function IconButton({ icon: Icon, badge }: { icon: typeof Bell; badge?: number }) {
  return (
    <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-card-2 text-fg-soft transition-colors hover:bg-hover">
      <Icon size={18} />
      {badge && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-negative px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
