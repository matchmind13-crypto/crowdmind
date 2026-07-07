import { ImageResponse } from 'next/og';
import { fetchPostForSeo } from '@/lib/seoPost';

/**
 * Dinamikus megosztási kép (OG-kép) minden témához:
 * cím + valódi mellette/ellene arány — ez a "nézd, hogyan szavaz a közösség" horog.
 */
export const alt = 'CrowdMind — a közösség véleménye';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchPostForSeo(Number(id));

  const title = post?.title ?? 'CrowdMind — a közösség véleménye';
  const category = post?.category ?? 'Közélet';
  const total = post ? post.yesVotes + post.noVotes : 0;
  const pct = total > 0 && post ? Math.round((post.yesVotes / total) * 100) : 50;

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
        {/* Fejléc: logó + kategória */}
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
          <div
            style={{
              display: 'flex',
              padding: '10px 24px',
              borderRadius: 999,
              background: 'rgba(124, 58, 237, 0.22)',
              border: '1px solid rgba(167, 139, 250, 0.4)',
              color: '#c4b5fd',
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        </div>

        {/* Cím */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 70 ? 52 : 62,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 1050,
          }}
        >
          {title.length > 120 ? `${title.slice(0, 120)}…` : title}
        </div>

        {/* Szavazás-sáv + lábléc */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: 26,
              borderRadius: 999,
              overflow: 'hidden',
              background: '#22242e',
            }}
          >
            <div style={{ display: 'flex', width: `${Math.max(pct, 2)}%`, background: '#22c55e' }} />
            <div style={{ display: 'flex', width: `${Math.max(100 - pct, 2)}%`, background: '#ef4444' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 30 }}>
            <div style={{ display: 'flex', gap: 28 }}>
              <span style={{ color: '#4ade80', fontWeight: 700 }}>{pct}% mellette</span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>{100 - pct}% ellene</span>
            </div>
            <span style={{ color: '#9ca3af' }}>
              {total} szavazat · szavazz te is a crowdmind.dev-en
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
