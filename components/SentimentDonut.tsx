/**
 * Érzelmi hangulat kördiagram (donut).
 * Három szegmens: pozitív (zöld), semleges (sárga), negatív (piros).
 * Középen a pozitív százalék.
 */
export function SentimentDonut({
  positive,
  neutral,
  negative,
  size = 132,
}: {
  positive: number;
  neutral: number;
  negative: number;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  const segments = [
    { value: positive, color: 'var(--color-positive)' },
    { value: neutral, color: 'var(--color-neutral)' },
    { value: negative, color: 'var(--color-negative)' },
  ];

  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} opacity={0.4} />
        {segments.map((s, i) => {
          const len = (s.value / 100) * c;
          const gap = 3; // kis rés a szegmensek között
          const dash = `${Math.max(len - gap, 0)} ${c - Math.max(len - gap, 0)}`;
          const el = (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-fg">{positive}%</span>
        <span className="text-xs text-muted">Pozitív</span>
      </div>
    </div>
  );
}
