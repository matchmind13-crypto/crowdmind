import { ImageResponse } from 'next/og';
import { fetchDailyIndex } from '@/lib/dailyIndex';

/** A napi index megosztási képe — ez a kártya terjed a közösségi médiában. */
export const alt = 'CrowdMind napi közhangulat-index';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const idx = await fetchDailyIndex();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #05070d 0%, #0d0a1f 55%, #1a1040 100%)',
          color: '#f4f4f6',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Fejléc */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                fontWeight: 700,
                color: 'white',
              }}
            >
              C
            </div>
            <div style={{ display: 'flex', fontSize: 36, fontWeight: 800 }}>
              <span style={{ color: 'white' }}>CROWD</span>
              <span style={{ color: '#a78bfa' }}>MIND</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#9ca3af' }}>{idx.day}</div>
        </div>

        {/* A nagy szám */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              padding: '8px 24px',
              borderRadius: 999,
              background: 'rgba(124, 58, 237, 0.22)',
              border: '1px solid rgba(167, 139, 250, 0.4)',
              color: '#c4b5fd',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            NAPI KÖZHANGULAT-INDEX
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 2 }}>
            <span style={{ fontSize: 118, fontWeight: 800, lineHeight: 1 }}>{idx.pct}</span>
            <span style={{ fontSize: 52, fontWeight: 800, color: '#a78bfa', marginTop: 16 }}>%</span>
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#d1d5db' }}>
            a magyar közösség hangulata ma{' '}
            <span style={{ color: '#4ade80', fontWeight: 700, marginLeft: 8 }}>pozitív</span>
          </div>
        </div>

        {/* A figyelemfelkeltő horog: a nap legmegosztóbb témája */}
        {idx.topDivisive && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 28px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 21, fontWeight: 700, letterSpacing: 1.5, color: '#f87171' }}>
              <span style={{ display: 'flex', width: 12, height: 12, borderRadius: 999, background: '#ef4444' }} />
              A NAP LEGMEGOSZTÓBB TÉMÁJA
            </span>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#f4f4f6', marginTop: 8 }}>
              {idx.topDivisive.title.length > 62
                ? `${idx.topDivisive.title.slice(0, 62)}…`
                : idx.topDivisive.title}
            </span>
            {idx.topDivisive.description.length > 0 && (
              <span style={{ fontSize: 21, color: '#9ca3af', marginTop: 6 }}>
                {idx.topDivisive.description.length > 92
                  ? `${idx.topDivisive.description.slice(0, 92)}…`
                  : idx.topDivisive.description}
              </span>
            )}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: 16,
                borderRadius: 999,
                overflow: 'hidden',
                background: '#22242e',
                marginTop: 14,
              }}
            >
              <div style={{ display: 'flex', width: `${Math.max(idx.topDivisive.pct, 2)}%`, background: '#22c55e' }} />
              <div style={{ display: 'flex', width: `${Math.max(100 - idx.topDivisive.pct, 2)}%`, background: '#ef4444' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 22 }}>
              <span style={{ display: 'flex', gap: 18 }}>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>{idx.topDivisive.pct}% mellette</span>
                <span style={{ color: '#f87171', fontWeight: 700 }}>{100 - idx.topDivisive.pct}% ellene</span>
              </span>
              <span style={{ color: '#9ca3af' }}>Te melyik oldalon állsz?</span>
            </div>
          </div>
        )}

        {/* Lábléc */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 24 }}>
          <span style={{ color: '#9ca3af' }}>
            {idx.totalVotes} valódi szavazat alapján
          </span>
          <span style={{ color: '#a78bfa', fontWeight: 700 }}>crowdmind.dev/ma</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
