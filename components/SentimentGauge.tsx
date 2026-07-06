import { globalSentiment } from '@/data/trends';
import { PanelCard, PanelHeader } from './PanelCard';

const cx = 100;
const cy = 100;
const r = 78;

function polar(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  // Fix tizedesjegyre kerekítünk, hogy a szerver- és kliens-render bitre egyezzen
  // (különben React hydration-eltérést jelez a lebegőpontos különbség miatt).
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 100) / 100,
    y: Math.round((cy - r * Math.sin(rad)) * 100) / 100,
  };
}

/** Ívszakasz path 180° (bal) → 0° (jobb) tartományban. */
function arc(a1: number, a2: number) {
  const p1 = polar(a1);
  const p2 = polar(a2);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
}

export function SentimentGauge() {
  const { positive, neutral, negative } = globalSentiment;
  // 0% => 180° (bal), 100% => 0° (jobb)
  const needleAngle = 180 - (positive / 100) * 180;
  const tip = polar(needleAngle);

  return (
    <PanelCard>
      <PanelHeader title="Hangulatindex" action="Részletek" />

      <div className="relative mx-auto" style={{ width: 200, height: 118 }}>
        <svg viewBox="0 0 200 118" width="200" height="118">
          {/* színes ívszakaszok */}
          <g fill="none" strokeWidth="13" strokeLinecap="round">
            <path d={arc(180, 136)} stroke="var(--color-negative)" />
            <path d={arc(134, 91)} stroke="#f59e0b" />
            <path d={arc(89, 46)} stroke="var(--color-neutral)" />
            <path d={arc(44, 0)} stroke="var(--color-positive)" />
          </g>
          {/* mutató */}
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="var(--color-fg)" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="var(--color-fg)" />
        </svg>

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-3xl font-bold text-positive">{positive}%</span>
          <span className="text-xs text-muted">Pozitív hangulat</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-muted">
          <span className="font-semibold text-fg">{neutral}%</span> Semleges
        </span>
        <span className="text-muted">
          <span className="font-semibold text-fg">{negative}%</span> Negatív
        </span>
      </div>
    </PanelCard>
  );
}
