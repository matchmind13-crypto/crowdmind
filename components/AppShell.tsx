import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { PreferencesProvider } from './PreferencesProvider';

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
              <aside className="hidden w-[360px] shrink-0 space-y-5 xl:block">
                {right}
              </aside>
            )}
          </div>
        </div>

        {/* Mobil: alsó navigáció + benyíló menü */}
        <MobileNav />
      </div>
    </PreferencesProvider>
  );
}
