import type { Metadata } from 'next';
import { fetchPostForSeo } from '@/lib/seoPost';
import { SITE_URL } from '@/lib/publicConfig';

/**
 * Beágyazható szavazás-widget (iframe-be szánva, pl. cikkek alá).
 * Szándékosan önálló, beégetett palettával stílusozott — külső oldalon is
 * pontosan így néz ki, függetlenül a CrowdMind témarendszerétől.
 * Az ingyenes verzió része a CrowdMind-logó és a visszalink (SEO + növekedés).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'CrowdMind szavazás',
};

const palettes = {
  dark: {
    bg: '#0b0e17',
    card: '#131722',
    line: '#262a38',
    fg: '#f4f4f6',
    muted: '#9ca3af',
    accent: '#a78bfa',
    positive: '#4ade80',
    negative: '#f87171',
    barBg: '#22242e',
  },
  light: {
    bg: '#f8f8fb',
    card: '#ffffff',
    line: '#e5e7eb',
    fg: '#111827',
    muted: '#6b7280',
    accent: '#7c3aed',
    positive: '#16a34a',
    negative: '#dc2626',
    barBg: '#e5e7eb',
  },
};

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const [{ postId }, { theme }] = await Promise.all([params, searchParams]);
  const p = palettes[theme === 'light' ? 'light' : 'dark'];
  const post = await fetchPostForSeo(Number(postId));

  const total = post ? post.yesVotes + post.noVotes : 0;
  const pct = total > 0 && post ? Math.round((post.yesVotes / total) * 100) : 50;
  const postUrl = post ? `${SITE_URL}/post/${post.id}?utm_source=embed` : SITE_URL;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: p.bg,
        display: 'flex',
        alignItems: 'stretch',
        padding: 10,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: p.card,
          border: `1px solid ${p.line}`,
          borderRadius: 14,
          padding: '16px 18px',
          minWidth: 0,
        }}
      >
        {/* Fejléc: kategória + logó-link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: p.accent,
            }}
          >
            {post ? post.category : 'CrowdMind'}
          </span>
          <a
            href={postUrl}
            target="_blank"
            rel="noopener"
            style={{ fontSize: 13, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            <span style={{ color: p.fg }}>CROWD</span>
            <span style={{ color: p.accent }}>MIND</span>
          </a>
        </div>

        {!post ? (
          <p style={{ margin: 0, fontSize: 14, color: p.muted }}>
            Ez a téma nem található.{' '}
            <a href={SITE_URL} target="_blank" rel="noopener" style={{ color: p.accent }}>
              Fedezd fel a CrowdMind-ot →
            </a>
          </p>
        ) : (
          <>
            {/* Kérdés */}
            <a
              href={postUrl}
              target="_blank"
              rel="noopener"
              style={{
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1.35,
                color: p.fg,
                textDecoration: 'none',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.title}
            </a>

            {/* Arány-sáv */}
            <div
              style={{
                display: 'flex',
                height: 10,
                borderRadius: 999,
                overflow: 'hidden',
                background: p.barBg,
              }}
            >
              <div style={{ width: `${Math.max(pct, 2)}%`, background: '#22c55e' }} />
              <div style={{ width: `${Math.max(100 - pct, 2)}%`, background: '#ef4444' }} />
            </div>

            {/* Számok + CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: 14, fontSize: 13 }}>
                <span style={{ color: p.positive, fontWeight: 700 }}>{pct}% mellette</span>
                <span style={{ color: p.negative, fontWeight: 700 }}>{100 - pct}% ellene</span>
                <span style={{ color: p.muted }}>{total} szavazat</span>
              </div>
              <a
                href={postUrl}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ffffff',
                  background: '#7c3aed',
                  padding: '7px 14px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Szavazok én is →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
