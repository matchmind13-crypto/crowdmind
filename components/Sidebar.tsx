'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Moon, Rss, Pencil, LogIn } from 'lucide-react';
import { mainNav, toolNav } from '@/data/navigation';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/lib/useUnread';
import { useTheme } from '@/lib/useTheme';
import { usePreferences } from './PreferencesProvider';
import { CategoryPickerModal } from './CategoryPickerModal';

export function Sidebar() {
  const pathname = usePathname();
  const { dark, toggle: toggleTheme } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { userId, preferred, loading } = usePreferences();
  const unread = useUnreadCount();

  return (
    <aside className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
      {/* Logó */}
      <Link href="/" className="flex items-center gap-2 px-2">
        <BrainLogo />
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-fg">CROWD</span>
          <span className="text-accent">MIND</span>
        </span>
      </Link>

      {/* Fő menü – minden pont saját aloldalra visz */}
      <nav className="space-y-1">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const badge = item.href === '/notifications' && unread > 0 ? unread : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                active ? 'bg-accent-strong/15 text-fg ring-1 ring-accent/20' : 'text-fg-soft hover:bg-hover',
              )}
            >
              <Icon size={18} className={active ? 'text-accent-soft' : 'text-muted'} />
              <span className="flex-1 text-left">{item.label}</span>
              {badge && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent-strong px-1 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Egyéni hírfolyam */}
      <div>
        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Egyéni hírfolyam</h3>
          {userId && (
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-soft transition-colors hover:text-accent"
            >
              <Pencil size={12} />
              Szerkesztés
            </button>
          )}
        </div>

        {loading ? (
          <div className="mx-2 h-10 animate-pulse rounded-lg bg-hover" />
        ) : !userId ? (
          <Link
            href="/login"
            className="mx-2 flex items-center gap-2 rounded-lg border border-line bg-card-2 px-3 py-2 text-xs text-muted transition-colors hover:bg-hover"
          >
            <LogIn size={14} className="text-accent-soft" />
            Jelentkezz be a személyre szabott hírfolyamhoz
          </Link>
        ) : preferred && preferred.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-2">
            {preferred.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-strong/10 px-2.5 py-1 text-xs text-fg-soft"
              >
                <Rss size={11} className="text-accent-soft" />
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setPickerOpen(true)}
            className="mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-left text-xs text-muted transition-colors hover:bg-hover"
          >
            <Rss size={14} className="text-accent-soft" />
            Állítsd be, mely témák érdekelnek
          </button>
        )}
      </div>

      {/* Eszközök – mindegyik saját aloldalra visz */}
      <div>
        <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted">Eszközök</h3>
        <div className="space-y-1">
          {toolNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-accent-strong/15 text-fg ring-1 ring-accent/20' : 'text-fg-soft hover:bg-hover',
                )}
              >
                <Icon size={18} className={active ? 'text-accent-soft' : 'text-muted'} />
                <span className="flex-1 text-left">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI asszisztens kártya */}
      <div className="mt-auto rounded-2xl border border-accent/25 bg-gradient-to-b from-accent-strong/15 to-transparent p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-strong/30 text-accent-soft">
            <Sparkles size={16} />
          </span>
          <span className="text-sm font-semibold text-fg">AI asszisztens</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Kérdezd az AI-t bármilyen témáról, és kapj azonnali elemzést!
        </p>
        <Link
          href="/assistant"
          className="mt-3 block w-full rounded-lg bg-accent-strong py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-accent"
        >
          Chat indítása
        </Link>
      </div>

      {/* Sötét mód kapcsoló – valódi téma-váltás, mentett beállítással */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-2 py-1 text-sm text-fg-soft"
      >
        <Moon size={16} className="text-muted" />
        <span>Sötét mód</span>
        <span
          className={cn(
            'ml-auto flex h-5 w-9 items-center rounded-full p-0.5 transition-colors',
            dark ? 'bg-accent-strong' : 'bg-line',
          )}
        >
          <span className={cn('h-4 w-4 rounded-full bg-white transition-transform', dark && 'translate-x-4')} />
        </span>
      </button>

      {/* Adatkezelés – GDPR tájékoztató */}
      <Link
        href="/privacy"
        className="px-2 pb-1 text-xs text-muted transition-colors hover:text-fg-soft"
      >
        Adatkezelési tájékoztató
      </Link>

      {pickerOpen && <CategoryPickerModal onClose={() => setPickerOpen(false)} />}
    </aside>
  );
}

function BrainLogo() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-strong to-accent text-white shadow-lg shadow-accent-strong/30">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      </svg>
    </span>
  );
}
