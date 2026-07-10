import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ThumbsUp, ChartLine, BrainCircuit, Target, UsersRound, CalendarDays, Bell, Award,
  UserPlus, Vote, MessagesSquare, PenLine, Share2, ShieldCheck, Scale, HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Mi a CrowdMind?',
  description:
    'A CrowdMind a magyar közösség véleményplatformja: kérdezz, szavazz, vitázz — az AI pedig összegzi, mit gondol a közösség. Ismerd meg, mit tud és hogyan használd!',
  alternates: { canonical: '/rolunk' },
};

/** Bemutatkozó oldal: mi a CrowdMind, mit tud pontosan, és hogyan használd. */
export default function AboutPage() {
  return (
    <AppShell wide>
      {/* Hero — a nagy logó, mint a bal felső sarokban, csak óriásban */}
      <section className="rounded-2xl border border-line bg-card px-6 py-12 text-center">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-accent-strong to-accent text-white shadow-2xl shadow-accent-strong/40">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
          </svg>
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-fg">CROWD</span>
          <span className="text-accent-soft">MIND</span>
        </h1>
        <p className="mt-3 text-lg font-medium text-fg-soft">A közösség véleménye, AI-val rendszerezve</p>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          A CrowdMind a magyar közösség véleményplatformja. Felteszel egy kérdést — a közösség
          szavaz és érvel — a mesterséges intelligencia pedig összegzi, mit gondol a többség, és
          mi a másik oldal legerősebb érve. Nem hírportál, és nem reprezentatív közvélemény-kutatás:
          élő, valós idejű közösségi vélemény, átlátszóan.
        </p>
      </section>

      {/* Mit tud pontosan? */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-fg">Mit tud pontosan?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={ThumbsUp} title="Szavazás három gombbal">
            Minden témára szavazhatsz: mellette, semleges vagy ellene. Fejenként egy szavazat, az
            arányok élőben mozognak a zöld–szürke–piros sávon.
          </FeatureCard>
          <FeatureCard icon={ChartLine} title="Vélemény-idővonal">
            Minden témánál visszanézheted, hogyan mozgott a közösség véleménye időben — mint egy
            árfolyam-grafikon, csak véleményekből.
          </FeatureCard>
          <FeatureCard icon={BrainCircuit} title="AI-elemzés + ördög ügyvédje">
            A Claude AI elolvassa az összes hozzászólást és szavazatot, összegzi az érveket — és
            mindig megmutatja a kisebbségi oldal legerősebb ellenérvét is. Nálunk nincs
            véleménybuborék.
          </FeatureCard>
          <FeatureCard icon={Target} title="Jóslatok és „Igazam lett”">
            Indíts jóslatot határidővel („Bejut-e X a döntőbe?”) — a határidő után kiderül az
            eredmény, és aki eltalálta, találatot kap a profiljára. Ezt a hitelességet nem lehet
            kamuzni.
          </FeatureCard>
          <FeatureCard icon={UsersRound} title="Csoportok">
            Alapíts saját csoportot bármilyen téma köré, vagy csatlakozz máséhoz — a csoport neve
            ott díszeleg a posztokon, az adatai (alapító, tagok) nyilvánosak.
          </FeatureCard>
          <FeatureCard icon={CalendarDays} title="Napi közhangulat-index">
            A crowdmind.dev/ma oldalon minden nap egyetlen szám mutatja az ország hangulatát a
            valódi szavazatokból — megosztható kártyával.
          </FeatureCard>
          <FeatureCard icon={Bell} title="Követés és értesítések">
            Kövess témákat és kategóriákat — értesítést kapsz minden új hozzászólásról, válaszról
            és arról is, ha bejött a jóslatod.
          </FeatureCard>
          <FeatureCard icon={Award} title="Hitelesség-jelvények">
            Az aktivitásod jelvényekben látszik (Új tag → Aktív tag → Törzstag), a vitákban pedig a
            legjobb érvek kerülnek felülre a közösség szavazatai alapján.
          </FeatureCard>
        </div>
      </section>

      {/* Hogyan használd? */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-fg">Hogyan használd? — 5 lépésben</h2>
        <div className="space-y-3">
          <StepCard n={1} icon={UserPlus} title="Regisztrálj — ingyen, egy perc alatt">
            Email-cím + felhasználónév, és kész. A felhasználóneved nyilvánosan megjelenik a
            tartalmaid mellett; profilképet feltölteni nem kötelező — alapból egy anonim ikont
            kapsz. Böngészni bejelentkezés nélkül is lehet, szavazni és hozzászólni fiókkal tudsz.
          </StepCard>
          <StepCard n={2} icon={Vote} title="Szavazz és olvass">
            A kezdőlapon három fül vár: <b>Neked</b> (a követett kategóriáid elöl), <b>Felkapott</b>{' '}
            és <b>Friss</b>. Legfelül mindig ott „A nap vitája” — a legmegosztóbb aktuális téma.
            Kattints a Mellette/Semleges/Ellene gombra, és nézd, hogyan áll a közösség.
          </StepCard>
          <StepCard n={3} icon={MessagesSquare} title="Szólj hozzá a vitákhoz">
            Írd le az érved, válaszolj másoknak (a @névvel meg is jelölheted, kinek szól), és
            értékeld a hozzászólásokat 👍/👎 gombbal — a legjobb érvek automatikusan felülre
            kerülnek. Ha valami szabálysértő, egy kattintással jelentheted.
          </StepCard>
          <StepCard n={4} icon={PenLine} title="Alkoss: téma, jóslat, csoport">
            Az „Új téma” gombbal kérdést, vitát vagy tapasztalatot oszthatsz meg (képpel, videóval
            együtt), jóslatot indíthatsz határidővel — vagy alapíthatsz saját csoportot, ahová a
            közösséged posztolhat.
          </StepCard>
          <StepCard n={5} icon={Share2} title="Maradj képben és oszd meg">
            Kövesd az izgalmas témákat (🔔), kérj AI-elemzést egy gombnyomással, és oszd meg a
            vitákat Messengeren, WhatsAppon vagy X-en — a linkből mindig mutatós kártya lesz a
            kérdéssel és az állással.
          </StepCard>
        </div>
      </section>

      {/* Alapelvek */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-fg">Amiben hiszünk</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <FeatureCard icon={ShieldCheck} title="Az adataid a tieid">
            Nincs nyomkövető süti, nincs hirdetési profil, és az adataidat nem adjuk el. Egy
            kattintással letöltheted vagy törölheted mindenedet.{' '}
            <Link href="/privacy" className="text-accent-soft underline">Adatkezelési tájékoztató →</Link>
          </FeatureCard>
          <FeatureCard icon={Scale} title="Buborék ellen">
            Az algoritmusok világában mi szándékosan megmutatjuk a másik oldalt is: az AI minden
            elemzésben odateszi a kisebbség legerősebb érvét. Dönteni csak a teljes kép ismeretében
            érdemes.
          </FeatureCard>
          <FeatureCard icon={HeartHandshake} title="Tisztességes vita">
            Kemény érvek igen, emberek bántása nem. A házirend rövid és közérthető, a moderáció
            pedig nem véleménycenzúra.{' '}
            <Link href="/szabalyzat" className="text-accent-soft underline">Szabályzat →</Link>
          </FeatureCard>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-accent/30 bg-accent-strong/10 p-6 text-center">
        <p className="text-lg font-bold text-fg">Készen állsz? A közösség már vitázik.</p>
        <p className="mt-1 text-sm text-muted">Egy perc regisztráció, és a te véleményed is számít.</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            <UserPlus size={16} />
            Csatlakozom
          </Link>
          <Link
            href="/ma"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card-2 px-5 py-3 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
          >
            Megnézem a mai közhangulatot
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ThumbsUp;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-strong/15 text-accent-soft">
        <Icon size={17} />
      </span>
      <p className="mt-2.5 text-sm font-bold text-fg">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

function StepCard({
  n,
  icon: Icon,
  title,
  children,
}: {
  n: number;
  icon: typeof ThumbsUp;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-line bg-card p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-strong text-base font-extrabold text-white">
        {n}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-bold text-fg">
          <Icon size={15} className="text-accent-soft" />
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
      </div>
    </div>
  );
}
