import type { Metadata } from 'next';
import Link from 'next/link';
import { ScrollText, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Felhasználási szabályzat',
  description:
    'A CrowdMind felhasználási szabályzata: fiók, házirend, moderáció, tartalom-jogok, AI-funkciók és felelősség — közérthetően.',
  alternates: { canonical: '/szabalyzat' },
};

/** Felhasználási szabályzat — közérthető nyelven, a /privacy párja. */
export default function TermsPage() {
  return (
    <AppShell wide>
    <main className="mx-auto w-full max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft"
      >
        <ArrowLeft size={15} />
        Vissza a CrowdMindra
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-strong/15 text-accent-soft">
          <ScrollText size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-fg">Felhasználási szabályzat</h1>
          <p className="text-sm text-muted">Hatályos: 2026. július 8-tól · crowdmind.dev</p>
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-accent/25 bg-accent-strong/10 p-4 text-sm leading-relaxed text-fg-soft">
        Ez a szabályzat szándékosan közérthető nyelven íródott: azt írja le, hogyan működik a
        CrowdMind, mit várunk el egymástól, és mi mit vállalunk. A CrowdMind használatával
        (regisztrációval vagy az oldal böngészésével) elfogadod az itt leírtakat. A személyes
        adatok kezeléséről külön dokumentum, az{' '}
        <Link href="/privacy" className="text-accent-soft underline">adatkezelési tájékoztató</Link>{' '}
        szól.
      </p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-fg-soft">
        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">1. Mi a CrowdMind, és ki üzemelteti?</h2>
          <p>
            A CrowdMind (crowdmind.dev) magyar közösségi véleményplatform: kérdéseket és vitákat
            indíthatsz, szavazhatsz mellette/ellene, hozzászólhatsz, az AI pedig összegzi a
            közösség álláspontját. Az oldalt magánszemélyként üzemeltetem. Kapcsolat:{' '}
            <a href="mailto:hello@crowdmind.dev" className="text-accent-soft underline">
              hello@crowdmind.dev
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">2. A fiókod</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>A regisztrációhoz be kell töltened a <span className="font-semibold text-fg">16. életévedet</span>.</li>
            <li>
              A felhasználóneved <span className="font-semibold text-fg">nyilvánosan megjelenik</span> a
              témáid és hozzászólásaid mellett — válaszd ennek tudatában.
            </li>
            <li>A fiókodhoz tartozó jelszó megőrzése a te felelősséged; a fiókoddal végzett tevékenységért te felelsz.</li>
            <li>Egy személy egy fiókot használjon — a több fiókkal való visszaélés (pl. szavazat-duplázás) tilos.</li>
            <li>
              A fiókodat bármikor, azonnal és véglegesen törölheted a{' '}
              <Link href="/profile" className="text-accent-soft underline">profilodon</Link> — ilyenkor
              minden adatod törlődik.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">3. Házirend — mit NE</h2>
          <p className="mb-2">
            A CrowdMind lényege a tisztességes vita: kemény érvek igen, emberek bántása nem. Tilos:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold text-fg">Gyűlöletkeltés, zaklatás, fenyegetés</span> — mások
              származása, vallása, neme, irányultsága vagy bármi más tulajdonsága alapján való
              lealacsonyítása.
            </li>
            <li>
              <span className="font-semibold text-fg">Spam és kéretlen reklám</span> — ismétlődő,
              promóciós vagy a témához nem kapcsolódó tartalom tömeges terjesztése.
            </li>
            <li>
              <span className="font-semibold text-fg">Jogsértő tartalom</span> — bármi, ami
              jogszabályba ütközik, vagy arra buzdít.
            </li>
            <li>
              <span className="font-semibold text-fg">Mások személyes adatainak közzététele</span> —
              cím, telefonszám, magánlevelezés vagy bármilyen azonosító engedély nélküli kirakása.
            </li>
            <li>
              <span className="font-semibold text-fg">Szándékos megtévesztés</span> — álhírek, hamis
              források tudatos terjesztése (tévedni szabad, hazudni nem).
            </li>
            <li>
              <span className="font-semibold text-fg">Más művének engedély nélküli feltöltése</span> —
              csak olyan képet/videót tölts fel, amit te készítettél, vagy amihez jogod van.
            </li>
            <li>
              <span className="font-semibold text-fg">A rendszer manipulálása</span> — kamu fiókok,
              szavazat-csalás, automatizált (bot) tevékenység, a korlátozások megkerülése.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">4. Moderáció</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Minden témánál és hozzászólásnál van <span className="font-semibold text-fg">Jelentés</span> gomb —
              ha szabályszegést látsz, jelezd; minden jelentést átnézünk.
            </li>
            <li>
              A házirendet sértő tartalmat eltávolíthatjuk; súlyos vagy ismételt szabályszegésnél a
              fiókot felfüggeszthetjük vagy törölhetjük.
            </li>
            <li>
              A moderáció nem véleménycenzúra: attól, hogy egy álláspont népszerűtlen, még helye van —
              a CrowdMind kifejezetten megmutatja a kisebbségi oldal érveit is.
            </li>
            <li>
              Ha úgy érzed, tévedésből ért moderációs döntés, írj a{' '}
              <a href="mailto:hello@crowdmind.dev" className="text-accent-soft underline">hello@crowdmind.dev</a>{' '}
              címre — megnézzük újra.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">5. A tartalmad és a jogaid</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Amit közzéteszel (téma, hozzászólás, kép, videó), az a <span className="font-semibold text-fg">te szellemi tulajdonod marad</span>.</li>
            <li>
              A közzététellel engedélyt adsz arra, hogy a tartalmadat a CrowdMind megjelenítse — az
              oldalon, a megosztási kártyákon, a beágyazható widgetben —, és az AI-elemzések
              elkészítéséhez felhasználja. Ez az engedély a tartalom törlésével megszűnik.
            </li>
            <li>A saját témádat és hozzászólásodat bármikor törölheted.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">6. Az AI-funkciókról őszintén</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Az AI-összegzések, elemzések és az „ördög ügyvédje" szekció{' '}
              <span className="font-semibold text-fg">automatikusan készülnek</span>, és a közösség
              hozzászólásait/szavazatait foglalják össze — tévedhetnek, és nem az üzemeltető
              véleményét tükrözik.
            </li>
            <li>
              Az AI-tartalom <span className="font-semibold text-fg">tájékoztató jellegű</span> — nem
              minősül jogi, pénzügyi, egészségügyi vagy más szakmai tanácsnak.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">7. A szavazásokról és az indexről</h2>
          <p>
            A szavazás-arányok, a vélemény-idővonal és a napi közhangulat-index a CrowdMind
            közösségének pillanatnyi véleményét mutatják — <span className="font-semibold text-fg">nem
            reprezentatív közvélemény-kutatás</span>, és nem a teljes magyar lakosság álláspontja.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">8. Sütik és adatkezelés</h2>
          <p>
            Nyomkövető sütiket nem használunk, hirdetési profilt nem építünk, az adataidat nem adjuk
            el. A böngésződben csak technikai beállítások tárolódnak (munkamenet, téma, az
            elfogadások ténye). Minden részlet az{' '}
            <Link href="/privacy" className="text-accent-soft underline">adatkezelési tájékoztatóban</Link>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">9. Felelősség</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              A felhasználói tartalmakért a közzétevőjük felel; az üzemeltető a tudomására jutott
              jogsértő tartalmak eltávolításáért felel a jogszabályok szerint.
            </li>
            <li>
              A szolgáltatást „ahogy van" nyújtjuk: mindent megteszünk a folyamatos működésért, de a
              megszakítás nélküli elérhetőséget és a hibamentességet nem tudjuk garantálni.
            </li>
            <li>Karbantartás vagy fejlesztés miatt az oldal időnként rövid időre elérhetetlen lehet.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">10. A szabályzat módosítása</h2>
          <p>
            Ha a szabályzat változik, az új változatot itt tesszük közzé a hatálybalépés dátumával.
            Lényeges változásnál a bejelentkezett felhasználókat értesítjük, és az oldal újra
            elkéri az elfogadást.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">11. Irányadó jog</h2>
          <p>
            A CrowdMind működésére és e szabályzatra a magyar jog az irányadó. Vitás kérdésben
            először mindig írj nekünk — a legtöbb dolog egy emailben rendeződik:{' '}
            <a href="mailto:hello@crowdmind.dev" className="text-accent-soft underline">hello@crowdmind.dev</a>.
          </p>
        </section>
      </div>

      <p className="mt-10 border-t border-line pt-5 text-xs text-muted">
        CrowdMind · A közösség véleménye, AI-val rendszerezve ·{' '}
        <Link href="/privacy" className="text-accent-soft underline">Adatkezelési tájékoztató</Link> ·{' '}
        <Link href="/" className="text-accent-soft underline">crowdmind.dev</Link>
      </p>
    </main>
    </AppShell>
  );
}
