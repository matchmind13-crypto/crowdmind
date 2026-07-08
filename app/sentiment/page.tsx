'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Gauge, TrendingUp, ThumbsUp, ThumbsDown, ArrowUpRight, ArrowDownRight, CalendarDays, ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { usePosts } from '@/lib/usePosts';
import { fetchPlatformTimeline } from '@/lib/postsDb';
import { formatCount } from '@/lib/utils';

/**
 * Hangulatindex – a közösség hangulatának bővebb nézete.
 * Minden adat VALÓDI: az összesített és kategóriánkénti hangulat a tényleges
 * mellette/ellene szavazatokból, a trend-görbe pedig a votes tábla
 * időbélyegeiből (fetchPlatformTimeline) számolódik.
 */
export default function SentimentPage() {
  const { posts, loading } = usePosts();

  const stats = useMemo(() => {
    const list = posts ?? [];
    const yes = list.reduce((s, p) => s + p.yesVotes, 0);
    const no = list.reduce((s, p) => s + p.noVotes, 0);
    const total = yes + no;
    const positive = total > 0 ? Math.round((yes / total) * 100) : 50;

    const byCat = new Map<string, { yes: number; no: number }>();
    list.forEach((p) => {
      const c = byCat.get(p.category[0]) ?? { yes: 0, no: 0 };
      c.yes += p.yesVotes; c.no += p.noVotes;
      byCat.set(p.category[0], c);
    });
    const categories = [...byCat.entries()]
      .map(([cat, v]) => ({ cat, ...v, total: v.yes + v.no, pct: v.yes + v.no > 0 ? Math.round((v.yes / (v.yes + v.no)) * 100) : 0 }))
      .filter((c) => c.total > 0)
      .sort((x, y) => y.pct - x.pct);

    const rated = list
      .map((p) => ({ ...p, total: p.yesVotes + p.noVotes, pct: p.yesVotes + p.noVotes > 0 ? Math.round((p.yesVotes / (p.yesVotes + p.noVotes)) * 100) : 0 }))
      .filter((p) => p.total > 0)
      .sort((x, y) => y.pct - x.pct);

    return { yes, no, total, positive, categories, best: rated[0] ?? null, worst: rated[rated.length - 1] ?? null };
  }, [posts]);

  // VALÓDI idősor: a votes tábla időbélyeges szavazataiból, naponta összegezve.
  const [trend, setTrend] = useState<{ day: string; forPct: number; total: number }[] | null>(null);
  useEffect(() => {
    let active = true;
    void fetchPlatformTimeline().then((t) => { if (active) setTrend(t); });
    return () => { active = false; };
  }, []);

  return (
    <AppShell wide>
      <PageHeader
        icon={Gauge}
        title="Hangulatindex"
        subtitle="A közösség hangulata a mellette/ellene szavazatok alapján – kategóriánkénti bontásban"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Gauge} value={loading ? '…' : `${stats.positive}%`} label="Pozitív hangulat összesen" />
        <StatCard icon={ThumbsUp} value={formatCount(stats.yes)} label="Mellette szavazat" />
        <StatCard icon={ThumbsDown} value={formatCount(stats.no)} label="Ellene szavazat" />
        <StatCard icon={TrendingUp} value={formatCount(stats.total)} label="Összes szavazat" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Nagy félkör-mérő (valódi összesített érték) */}
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-fg">Összesített hangulat</h2>
          <BigGauge value={stats.positive} />
          <p className="mt-3 text-center text-xs text-muted">
            {formatCount(stats.total)} valódi szavazat alapján számolva
          </p>
        </div>

        {/* Hangulat-trend – VALÓDI napi idősor a szavazatokból */}
        <div className="rounded-2xl border border-line bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-fg">Hangulat-trend</h2>
            <span className="rounded-md bg-positive/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-positive">Valódi adat</span>
          </div>
          {trend === null ? (
            <div className="h-32 animate-pulse rounded-xl bg-card-2" />
          ) : trend.length < 2 ? (
            <p className="py-8 text-center text-sm leading-relaxed text-muted">
              Még kevés napi adat van a görbéhez — minden nappal és szavazattal itt
              rajzolódik ki, merre mozog a közösség hangulata. 📈
            </p>
          ) : (
            <>
              <TrendChart points={trend.map((t) => t.forPct)} labels={trend.map((t) => t.day.slice(5).replace('-', '.'))} />
              <p className="mt-3 text-center text-xs text-muted">
                A közösség kumulatív támogatottsága naponta, minden valódi szavazat alapján
              </p>
            </>
          )}
        </div>
      </div>

      {/* Megosztható napi index */}
      <Link
        href="/ma"
        className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent-strong/10 p-4 transition-colors hover:bg-accent-strong/15"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-strong/20 text-accent-soft">
          <CalendarDays size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-fg">Napi közhangulat-index</span>
          <span className="block text-xs text-muted">
            A mai hangulat egyetlen megosztható oldalon — crowdmind.dev/ma
          </span>
        </span>
        <ArrowRight size={16} className="shrink-0 text-accent-soft" />
      </Link>

      {/* Kategóriánkénti bontás (valódi) */}
      <div className="rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-fg">Kategóriánkénti hangulat</h2>
        {stats.categories.length === 0 ? (
          <p className="text-sm text-muted">Még nincs elég szavazat a kategóriánkénti bontáshoz.</p>
        ) : (
          <div className="space-y-3">
            {stats.categories.map((c) => (
              <div key={c.cat} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm text-fg-soft">{c.cat}</span>
                <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="bg-positive" style={{ width: `${c.pct}%` }} />
                  <div className="bg-negative" style={{ width: `${100 - c.pct}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-semibold text-fg">{c.pct}%</span>
                <span className="w-20 shrink-0 text-right text-xs text-muted">{formatCount(c.total)} szav.</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legpozitívabb / legmegosztóbb téma (valódi) */}
      {stats.best && stats.worst && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/post/${stats.best.id}`} className="rounded-2xl border border-positive/30 bg-positive/5 p-4 transition-colors hover:bg-positive/10">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-positive">
              <ArrowUpRight size={14} /> Legpozitívabb fogadtatás
            </p>
            <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-fg">{stats.best.title}</p>
            <p className="mt-1 text-xs text-muted">{stats.best.pct}% mellette · {formatCount(stats.best.total)} szavazat</p>
          </Link>
          <Link href={`/post/${stats.worst.id}`} className="rounded-2xl border border-negative/30 bg-negative/5 p-4 transition-colors hover:bg-negative/10">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-negative">
              <ArrowDownRight size={14} /> Legkritikusabb fogadtatás
            </p>
            <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-fg">{stats.worst.title}</p>
            <p className="mt-1 text-xs text-muted">{stats.worst.pct}% mellette · {formatCount(stats.worst.total)} szavazat</p>
          </Link>
        </div>
      )}
    </AppShell>
  );
}

function BigGauge({ value }: { value: number }) {
  const cx = 130, cy = 120, r = 100;
  const polar = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: Math.round((cx + r * Math.cos(rad)) * 100) / 100, y: Math.round((cy - r * Math.sin(rad)) * 100) / 100 };
  };
  const arc = (a1: number, a2: number) => {
    const p1 = polar(a1), p2 = polar(a2);
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
  };
  const needle = polar(180 - (value / 100) * 180);

  return (
    <div className="relative mx-auto" style={{ width: 260, height: 150 }}>
      <svg viewBox="0 0 260 150" width="260" height="150">
        <g fill="none" strokeWidth="16" strokeLinecap="round">
          <path d={arc(180, 136)} stroke="var(--color-negative)" />
          <path d={arc(134, 91)} stroke="#f59e0b" />
          <path d={arc(89, 46)} stroke="var(--color-neutral)" />
          <path d={arc(44, 0)} stroke="var(--color-positive)" />
        </g>
        <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="var(--color-fg)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="7" fill="var(--color-fg)" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-4xl font-extrabold text-positive">{value}%</span>
        <p className="text-xs text-muted">Pozitív hangulat</p>
      </div>
    </div>
  );
}

function TrendChart({ points, labels }: { points: number[]; labels: string[] }) {
  const w = 420, h = 130, pad = 10;
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const xi = (i: number) => Math.round((pad + i * step) * 100) / 100;
  const y = (v: number) => Math.round((h - pad - (v / 100) * (h - pad * 2)) * 100) / 100;
  const line = points.map((p, i) => `${xi(i)},${y(p)}`).join(' ');
  const area = `${pad},${h - pad} ${line} ${xi(points.length - 1)},${h - pad}`;
  // Legfeljebb 7 dátum-címke, egyenletesen ritkítva, hogy sok nap esetén se torlódjanak.
  const labelStep = Math.max(1, Math.ceil(labels.length / 7));
  const shown = labels.filter((_, i) => i % labelStep === 0 || i === labels.length - 1);

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="trendfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={y(50)} x2={w - pad} y2={y(50)} stroke="var(--color-line)" strokeDasharray="4 4" />
        <polygon points={area} fill="url(#trendfill)" />
        <polyline points={line} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={xi(i)} cy={y(p)} r="3.5" fill="var(--color-accent)" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-muted">
        {shown.map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
      </div>
    </div>
  );
}
