import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Adatkezelési tájékoztató',
  description:
    'Hogyan kezeli a CrowdMind a személyes adataidat: mit tárolunk, miért, meddig, és milyen jogaid vannak.',
  alternates: { canonical: '/privacy' },
};

/** Adatkezelési tájékoztató — önálló, letisztult oldal (AppShell nélkül is olvasható). */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft"
      >
        <ArrowLeft size={15} />
        Vissza a CrowdMindra
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-strong/15 text-accent-soft">
          <ShieldCheck size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-fg">Adatkezelési tájékoztató</h1>
          <p className="text-sm text-muted">Hatályos: 2026. július 8-tól · crowdmind.dev</p>
        </div>
      </div>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-fg-soft">
        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">1. Ki kezeli az adataidat?</h2>
          <p>
            A crowdmind.dev oldalt (a továbbiakban: CrowdMind) magánszemélyként üzemeltetem.
            Adatkezelési kérdésben a{' '}
            <a href="mailto:hello@crowdmind.dev" className="text-accent-soft underline">
              hello@crowdmind.dev
            </a>{' '}
            címen érsz el.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">2. Milyen adatokat kezelünk, és miért?</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold text-fg">Fiókadatok:</span> email-cím és jelszó
              (titkosítva), valamint a választott felhasználónév. Cél: a bejelentkezés és a fiókod
              azonosítása. Jogalap: a szolgáltatás nyújtása (szerződés teljesítése).
            </li>
            <li>
              <span className="font-semibold text-fg">Tartalmaid:</span> az általad indított témák,
              hozzászólások, szavazatok, lájkok, mentések, követések és jelentések. Cél: ez maga a
              szolgáltatás — a közösségi véleményplatform működése.
            </li>
            <li>
              <span className="font-semibold text-fg">Beállítások:</span> a követett kategóriáid és a
              téma-beállításod (világos/sötét mód — utóbbi csak a böngésződben tárolódik).
            </li>
            <li>
              <span className="font-semibold text-fg">Értesítések:</span> a fiókodhoz címzett
              rendszerüzenetek (pl. „valaki hozzászólt a témádhoz").
            </li>
          </ul>
          <p className="mt-3">
            Nem gyűjtünk hirdetési profilt, nem használunk nyomkövető sütiket, és nem adjuk el az
            adataidat senkinek.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">3. Kik dolgozzák fel az adatokat? (adatfeldolgozók)</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold text-fg">Supabase</span> — az adatbázis és a
              bejelentkezés szolgáltatója (itt tárolódnak a fiók- és tartalomadatok).
            </li>
            <li>
              <span className="font-semibold text-fg">Vercel</span> — a weboldal tárhelye és
              kiszolgálója; emellett süti nélküli, anonim látogatottsági statisztikát mér
              (oldalletöltések száma — személyes profil és nyomkövetés nélkül).
            </li>
            <li>
              <span className="font-semibold text-fg">Anthropic (Claude AI)</span> — az AI-elemzés
              funkcióhoz a témák és hozzászólások szövege (felhasználónév és email nélkül) kerül
              feldolgozásra, kizárólag az összegzés elkészítéséhez.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">4. Meddig tároljuk az adatokat?</h2>
          <p>
            Amíg a fiókod létezik. Ha törlöd a fiókodat, minden személyes adatod — a fiók, a témáid,
            hozzászólásaid, szavazataid, lájkjaid, követéseid, mentéseid és értesítéseid — véglegesen
            és visszavonhatatlanul törlődik.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">5. Milyen jogaid vannak?</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold text-fg">Hozzáférés és hordozhatóság:</span> a{' '}
              <Link href="/profile" className="text-accent-soft underline">profilodon</Link> egy
              kattintással letöltheted az összes adatodat géppel olvasható (JSON) formátumban.
            </li>
            <li>
              <span className="font-semibold text-fg">Helyesbítés:</span> a felhasználónevedet a
              profilodon bármikor módosíthatod.
            </li>
            <li>
              <span className="font-semibold text-fg">Törlés („az elfeledtetéshez való jog"):</span>{' '}
              a profilodon található „Fiók végleges törlése" gombbal a teljes fiókodat és minden
              adatodat törölheted — azonnal, kérvényezés nélkül.
            </li>
            <li>
              <span className="font-semibold text-fg">Panasz:</span> ha úgy érzed, az adataidat nem
              megfelelően kezeljük, írj a fenti email-címre, vagy fordulhatsz a Nemzeti Adatvédelmi
              és Információszabadság Hatósághoz (NAIH, naih.hu).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">6. Sütik és helyi tárolás</h2>
          <p>
            Nyomkövető sütiket nem használunk. A böngésződ helyi tárolójában (localStorage) csak
            technikai beállítások vannak: a bejelentkezési munkameneted, a választott téma
            (világos/sötét), a legutóbbi látogatásod ideje (az „Üdv újra" sávhoz), valamint annak
            ténye, hogy ezt a tájékoztatót elfogadtad. Ezek a készülékeden maradnak.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-fg">7. Változások</h2>
          <p>
            Ha ez a tájékoztató változik, a módosítást ezen az oldalon tesszük közzé a hatálybalépés
            dátumával. Jelentős változásról a bejelentkezett felhasználókat értesítjük.
          </p>
        </section>
      </div>

      <p className="mt-10 border-t border-line pt-5 text-xs text-muted">
        CrowdMind · A közösség véleménye, AI-val rendszerezve ·{' '}
        <Link href="/szabalyzat" className="text-accent-soft underline">Felhasználási szabályzat</Link> ·{' '}
        <Link href="/" className="text-accent-soft underline">crowdmind.dev</Link>
      </p>
    </main>
  );
}
