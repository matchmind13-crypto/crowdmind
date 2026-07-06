'use client';
import { usePosts } from '@/lib/usePosts';
import { formatCount } from '@/lib/utils';
import { PanelCard, PanelHeader, PanelFooterLink } from './PanelCard';

const cx = 100;
const cy = 100;
const r = 78;

function polar(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  // Fix tizedesjegyre kerekítünk, hogy a szerver- és kliens-render bitre egyezzen.
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 100) / 100,
    y: Math.round((cy - r * Math.sin(rad)) * 100) / 100,
  };
}

function arc(a1: number, a2: number) {
  const p1 = polar(a1);
  const p2 = polar(a2);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
}

/**
 * Hangulatindex mini-panel – VALÓDI adat: az összes mellette/ellene
 * szavazatból számolt pozitív arány (a /sentiment oldallal azonos logika).
 */
export function SentimentGauge() {
  const { posts, loading } = usePosts();

  const yes = (posts ?? []).reduce((s, p) => s + p.yesVotes, 0);
  const no = (posts ?? []).reduce((s, p) => s + p.noVotes, 0);
  const total = yes + no;
  const positive = total > 0 ? Math.round((yes / total) * 100) : 50;

  const needleAngle = 180 - (positive / 100) * 180;
  const tip = polar(needleAngle);

  return (
    <PanelCard>
      <PanelHeader title="Hangulatindex" action="Részletek" actionHref="/sentiment" />

      <div className="relative mx-auto" style={{ width: 200, height: 118 }}>
        <svg viewBox="0 0 200 118" width="200" height="118">
          <g fill="none" strokeWidth="13" strokeLinecap="round">
            <path d={arc(180, 136)} stroke="var(--color-negative)" />
            <path d={arc(134, 91)} stroke="#f59e0b" />
            <path d={arc(89, 46)} stroke="var(--color-neutral)" />
            <path d={arc(44, 0)} stroke="var(--color-positive)" />
          </g>
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="var(--color-fg)" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="var(--color-fg)" />
        </svg>

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-3xl font-bold text-positive">{loading ? '…' : `${positive}%`}</span>
          <span className="text-xs text-muted">Pozitív hangulat</span>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        {total > 0 ? `${formatCount(total)} valódi szavazat alapján` : 'Még kevés szavazat érkezett'}
      </p>
      <PanelFooterLink label="Teljes hangulatindex" href="/sentiment" />
    </PanelCard>
  );
}
