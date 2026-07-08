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
              padding: '10px 28px',
              borderRadius: 999,
              background: 'rgba(124, 58, 237, 0.22)',
              border: '1px solid rgba(167, 139, 250, 0.4)',
              color: '#c4b5fd',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            NAPI KÖZHANGULAT-INDEX
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 8 }}>
            <span style={{ fontSize: 200, fontWeight: 800, lineHeight: 1 }}>{idx.pct}</span>
            <span style={{ fontSize: 80, fontWeight: 800, color: '#a78bfa', marginTop: 30 }}>%</span>
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#d1d5db' }}>
            a magyar közösség hangulata ma{' '}
            <span style={{ color: '#4ade80', fontWeight: 700, marginLeft: 10 }}>pozitív</span>
          </div>
        </div>

        {/* Lábléc */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 27 }}>
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
