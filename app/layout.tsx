'use client';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = ['Sport', 'Foci', 'Technológia', 'Autók', 'Pénzügy', 'Egészség', 'Utazás', 'Film & Sorozat'];
  const navItems = [
    { href: '/', icon: '🏠', label: 'Kezdőlap' },
    { href: '/trending', icon: '🔥', label: 'Trendek' },
    { href: '/notifications', icon: '🔔', label: 'Értesítések' },
    { href: '/profile', icon: '👤', label: 'Profil' },
  ];

  return (
    <html lang="hu">
      <body style={{ background: '#0a0a0f', minHeight: '100vh', color: '#f0f0ff', margin: 0, display: 'flex' }}>

        {/* Fix sidebar */}
        <div style={{
          width: '240px', minHeight: '100vh', background: '#0a0a0f',
          borderRight: '1px solid #1f1f2b', padding: '20px 0',
          position: 'sticky', top: 0, overflowY: 'auto', flexShrink: 0
        }}>
          <div style={{ padding: '0 20px 20px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
              CROWD<span style={{ color: '#8b5cf6' }}>MIND</span>
            </span>
          </div>

          <nav style={{ padding: '8px 0' }}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 20px', color: '#f0f0ff', textDecoration: 'none', fontSize: '15px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#16161f')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ padding: '20px 20px 8px', fontSize: '12px', color: '#666', letterSpacing: '0.5px' }}>
            TÉMAKÖRÖK
          </div>
          <nav>
            {categories.map((cat) => (
              <Link key={cat} href={`/categories/${cat.toLowerCase()}`} style={{
                display: 'block', padding: '8px 20px', color: '#c0c0d0',
                textDecoration: 'none', fontSize: '14px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#16161f')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>

        {/* Fő tartalom */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>

      </body>
    </html>
  );
}
