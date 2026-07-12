'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { PreferencesProvider } from './PreferencesProvider';
import { InterestsOnboarding } from './InterestsOnboarding';

/**
 * Minden valódi oldalon (a /login kivételével, mert az nincs AppShell-ben)
 * elmentjük az aktuális útvonalat — így a login oldal be tud fejeztével pontosan
 * oda visszairányítani, ahonnan a felhasználó jött (pl. egy megosztott poszt).
 */
function useRememberReturnPath() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    window.sessionStorage.setItem('cm_return_to', pathname);
  }, [pathname]);
}

/**
 * Közös oldalváz minden aloldalhoz: fix bal sidebar + felső sáv + tartalom.
 * - `right`: opcionális jobb oldali panel (360px, xl felett látszik)
 * - `wide`: ha nincs jobb panel, a fő hasáb szélesebb lehet
 */
export function AppShell({
  children,
  right,
  wide = false,
}: {
  children: ReactNode;
  right?: ReactNode;
  wide?: boolean;
}) {
  useRememberReturnPath();
  return (
    <PreferencesProvider>
      <div className="min-h-screen">
        <div className="fixed left-0 top-0 z-40 hidden h-screen w-60 border-r border-line bg-bg-elevated lg:block">
          <Sidebar />
        </div>

        <div className="lg:pl-60">
          <Topbar />

          <div className="mx-auto flex max-w-[1380px] justify-center gap-6 px-4 pb-24 pt-6 sm:px-6 lg:pb-6">
            <main className={`w-full space-y-5 ${wide && !right ? 'max-w-[1240px]' : 'max-w-[880px]'}`}>
              {children}
            </main>

            {right && (
              <aside className="hidden w-[360px] shrink-0 xl:block">
                {/* Ragadós panel: görgetésnél a helyén marad, csak a fő hasáb mozog.
                    Ha magasabb a képernyőnél, belül görgethető. */}
                <div className="sticky top-[76px] max-h-[calc(100vh-92px)] space-y-5 overflow-y-auto pb-2 pr-1 [scrollbar-width:thin]">
                  {right}
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Mobil: alsó navigáció + benyíló menü */}
        <MobileNav />

        {/* Bejelentkezés utáni kötelező érdeklődés-választó (min. 5 témakör) */}
        <InterestsOnboarding />
      </div>
    </PreferencesProvider>
  );
}
