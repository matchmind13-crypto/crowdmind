'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Bell, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/lib/useUnread';
import { Sidebar } from './Sidebar';

/**
 * Mobil navigáció (csak lg alatt látszik):
 * - alsó sáv az 5 leggyakoribb művelettel,
 * - "Menü" gombra oldalról benyíló teljes menü (a desktop Sidebar tartalma).
 */
export function MobileNav() {
  const pathname = usePathname();
  const unread = useUnreadCount();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Útvonal-váltáskor csukjuk a menüt.
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Nyitott menü alatt ne görögjön a háttér.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const items = [
    { label: 'Kezdőlap', href: '/', icon: Home },
    { label: 'Felfedezés', href: '/discover', icon: Compass },
  ];

  return (
    <>
      {/* Alsó navigációs sáv */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg-elevated/95 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium',
                  active ? 'text-accent-soft' : 'text-muted',
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}

          {/* Kiemelt Új téma gomb középen */}
          <Link href="/create" className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted">
            <span className="grid h-8 w-8 -mt-1 place-items-center rounded-xl bg-accent-strong text-white shadow-lg shadow-accent-strong/40">
              <Plus size={18} />
            </span>
            Új téma
          </Link>

          <Link
            href="/notifications"
            className={cn(
              'relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium',
              pathname === '/notifications' ? 'text-accent-soft' : 'text-muted',
            )}
          >
            <span className="relative">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-negative px-1 text-[9px] font-bold text-white">
                  {unread}
                </span>
              )}
            </span>
            Értesítések
          </Link>

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted"
          >
            <Menu size={20} />
            Menü
          </button>
        </div>
      </nav>

      {/* Benyíló teljes menü */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-bg-elevated shadow-2xl shadow-black/50">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted"
              aria-label="Menü bezárása"
            >
              <X size={16} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}
