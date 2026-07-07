'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { fetchOpinionTimeline, type TimelinePoint } from '@/lib/postsDb';

/**
 * Vélemény-idővonal — a CrowdMind megkülönböztető eleme:
 * hogyan mozgott a téma támogatottsága időben, minden valódi szavazat alapján.
 */
export function OpinionTimeline({ postId }: { postId: number }) {
  const [points, setPoints] = useState<TimelinePoint[] | null>(null);

  useEffect(() => {
    let active = true;
    void fetchOpinionTimeline(postId).then((p) => { if (active) setPoints(p); });
    return () => { active = false; };
  }, [postId]);

  if (points === null) {
    return (
      <p className="flex items-center gap-2 py-4 text-xs text-muted">
        <Loader2 size={13} className="animate-spin" /> Idővonal betöltése…
      </p>
    );
  }

  // Legalább 2 tényleges szavazat-esemény kell egy értelmes vonalhoz.
  if (points.length < 3 || points[points.length - 1].total < 2) {
    return (
      <p className="py-3 text-xs leading-relaxed text-muted">
        Még kevés szavazat érkezett az idővonalhoz — minden új szavazattal gyűlik az adat,
        és itt fog kirajzolódni, merre mozog a közösség véleménye. 📈
      </p>
    );
  }

  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.forPct - first.forPct;

  // SVG geometria — időarányos x-tengely, fix kerekítéssel.
  const w = 560, h = 120, pad = 8;
  const t0 = new Date(first.t).getTime();
  const t1 = new Date(last.t).getTime();
  const span = Math.max(1, t1 - t0);
  const x = (t: string) => Math.round((pad + ((new Date(t).getTime() - t0) / span) * (w - pad * 2)) * 100) / 100;
  const y = (pct: number) => Math.round((h - pad - (pct / 100) * (h - pad * 2)) * 100) / 100;
  const line = points.map((p) => `${x(p.t)},${y(p.forPct)}`).join(' ');
  const area = `${x(first.t)},${h - pad} ${line} ${x(last.t)},${h - pad}`;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });

  return (
    <div className="pt-2">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold uppercase tracking-wide text-muted">Vélemény-idővonal</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
            delta > 0 ? 'bg-positive/15 text-positive' : delta < 0 ? 'bg-negative/15 text-negative' : 'bg-hover text-muted'
          }`}
        >
          {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          {delta > 0 ? `+${delta}` : delta} pont az indulás óta
        </span>
        <span className="ml-auto text-muted">{last.total} szavazat összesen</span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="A téma támogatottságának alakulása időben">
        <defs>
          <linearGradient id={`tl-fill-${postId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={y(50)} x2={w - pad} y2={y(50)} stroke="var(--color-line)" strokeDasharray="4 4" />
        <polygon points={area} fill={`url(#tl-fill-${postId})`} />
        <polyline points={line} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(last.t)} cy={y(last.forPct)} r="4" fill="var(--color-accent)" />
      </svg>

      <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
        <span>{fmtDate(first.t)} · {first.forPct}% mellette</span>
        <span className="font-semibold text-fg-soft">ma: {last.forPct}% mellette</span>
        <span>{fmtDate(last.t)}</span>
      </div>
    </div>
  );
}
