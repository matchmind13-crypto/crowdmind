'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Check } from 'lucide-react';

/**
 * Adatkezelés-elfogadó kapu: első látogatáskor jelenik meg, és addig marad,
 * amíg a látogató el nem fogadja. Az elfogadás verziózott — ha a tájékoztató
 * lényegesen változik (új dátum), a kapu újra megjelenik.
 * Nem jelenik meg: a /privacy oldalon (hogy el lehessen olvasni) és a
 * beágyazott widgetben (/embed — az mások oldalán fut).
 */
const CONSENT_KEY = 'crowdmind_privacy_consent';
const CONSENT_VERSION = '2026-07-08';

export function PrivacyConsent() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(CONSENT_KEY) !== CONSENT_VERSION);
    } catch {
      // privát mód: nem tudjuk menteni — nem zaklatjuk minden oldalon
    }
  }, []);

  if (!show || pathname === '/privacy' || pathname === '/szabalyzat' || pathname.startsWith('/embed')) return null;

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_KEY, CONSENT_VERSION);
    } catch {
      // privát mód – az aktuális munkamenetre így is eltűnik
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-2xl border border-line bg-card p-5 shadow-2xl shadow-black/50 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-strong/15 text-accent-soft">
            <ShieldCheck size={20} />
          </span>
          <h2 className="text-base font-bold text-fg">Adatkezelés a CrowdMindon</h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-fg-soft">
          A CrowdMind csak a működéshez szükséges adatokat kezeli: a fiókodat, a tartalmaidat és a
          beállításaidat. <span className="font-semibold text-fg">Nyomkövető sütiket nem használunk,
          és az adataidat nem adjuk el senkinek.</span> Az oldal használatához kérjük, fogadd el az
          adatkezelési tájékoztatót és a{' '}
          <Link href="/szabalyzat" className="text-accent-soft underline">
            felhasználási szabályzatot
          </Link>
          .
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={accept}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            <Check size={16} />
            Elfogadom
          </button>
          <Link
            href="/privacy"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-line bg-card-2 py-3 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
          >
            Tájékoztató elolvasása
          </Link>
        </div>
      </div>
    </div>
  );
}
