import type { Metadata } from 'next';
import Link from 'next/link';
import { Gauge, TrendingUp, TrendingDown, Minus, Flame, Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { fetchDailyIndex } from '@/lib/dailyIndex';
import { ShareDailyIndex, CopyIndexLink } from '@/components/ShareDailyIndex';

/**
 * Napi közhangulat-index — a CrowdMind megosztható "címlapja":
 * crowdmind.dev/ma. Minden szám valódi szavazatokból, naponta frissül.
 */
export async function generateMetadata(): Promise<Metadata> {
  const idx = await fetchDailyIndex();
  const description = `A magyar közösség hangulata ma ${idx.pct}% pozitív (${idx.totalVotes} valódi szavazat alapján). Nézd meg, mely témák mozgatják — és szavazz te is!`;
  return {
    title: `Napi közhangulat-index — ${idx.pct}% pozitív`,
    description,
    alternates: { canonical: '/ma' },
    openGraph: { title: 'CrowdMind napi közhangulat-index', description, url: '/ma' },
    twitter: { card: 'summary_large_image', description },
  };
}

export default async function DailyIndexPage() {
  const idx = await fetchDailyIndex();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft"
        >
          <ArrowLeft size={15} />
          CrowdMind
        </Link>
        <span className="text-sm text-muted">{idx.day}</span>
      </div>

      {/* A nagy szám */}
      <section className="mt-10 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-strong/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-soft">
          <Gauge size={14} />
          Napi közhangulat-index
        </p>
        <p className="mt-6 text-7xl font-extrabold tracking-tight text-fg sm:text-8xl">
          {idx.pct}<span className="text-4xl text-accent-soft sm:text-5xl">%</span>
        </p>
        <p className="mt-2 text-lg font-semibold text-fg-soft">
          a magyar közösség hangulata ma <span className="text-positive">pozitív</span>
        </p>
        <p className="mt-1.5 flex items-center justify-center gap-2 text-sm text-muted">
          {idx.delta === null ? (
            <>
              <Minus size={14} />
              {idx.totalVotes} valódi szavazat alapján
            </>
          ) : idx.delta > 0 ? (
            <>
              <TrendingUp size={14} className="text-positive" />
              <span className="font-semibold text-positive">+{idx.delta} pont</span> tegnaphoz képest · {idx.totalVotes} szavazat
            </>
          ) : idx.delta < 0 ? (
            <>
              <TrendingDown size={14} className="text-negative" />
              <span className="font-semibold text-negative">{idx.delta} pont</span> tegnaphoz képest · {idx.totalVotes} szavazat
            </>
          ) : (
            <>
              <Minus size={14} />
              változatlan tegnaphoz képest · {idx.totalVotes} szavazat
            </>
          )}
        </p>
      </section>

      {/* Mi mozgatja ma a közösséget */}
      <section className="mt-10 space-y-3">
        {idx.topDivisive && (
          <Link
            href={`/post/${idx.topDivisive.id}`}
            className="block rounded-2xl border border-line bg-card p-4 transition-colors hover:bg-hover"
          >
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-negative">
              <Flame size={13} />
              A nap legmegosztóbb témája
            </p>
            <p className="mt-1.5 font-semibold text-fg">{idx.topDivisive.title}</p>
            <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-line">
              <div className="bg-positive" style={{ width: `${idx.topDivisive.pct}%` }} />
              <div className="bg-negative" style={{ width: `${100 - idx.topDivisive.pct}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {idx.topDivisive.pct}% mellette · {100 - idx.topDivisive.pct}% ellene · {idx.topDivisive.total} szavazat
            </p>
          </Link>
        )}

        {idx.topActive && idx.topActive.id !== idx.topDivisive?.id && (
          <Link
            href={`/post/${idx.topActive.id}`}
            className="block rounded-2xl border border-line bg-card p-4 transition-colors hover:bg-hover"
          >
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent-soft">
              <Activity size={13} />
              A nap legaktívabb témája
            </p>
            <p className="mt-1.5 font-semibold text-fg">{idx.topActive.title}</p>
            <p className="mt-1.5 text-xs text-muted">{idx.topActive.total} szavazat</p>
          </Link>
        )}
      </section>

      {/* Megosztás + CTA */}
      <section className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
        <ShareDailyIndex pct={idx.pct} day={idx.day} />
        <CopyIndexLink />
      </section>

      <section className="mt-8 rounded-2xl border border-accent/25 bg-accent-strong/10 p-5 text-center">
        <p className="text-sm font-semibold text-fg">A te véleményed is számít bele.</p>
        <p className="mt-1 text-sm text-muted">
          Az index minden szavazattal mozog — mondd el, te hogy látod.
        </p>
        <Link
          href="/"
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
        >
          Szavazok a témákra
          <ArrowRight size={15} />
        </Link>
      </section>

      <p className="mt-auto pt-8 text-center text-xs text-muted">
        CrowdMind · valódi közösségi szavazatokból, naponta frissülve · crowdmind.dev/ma
      </p>
    </main>
  );
}
