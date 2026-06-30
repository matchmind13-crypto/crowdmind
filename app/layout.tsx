'use client';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = [
    { name: 'Sport', icon: '⚽' },
    { name: 'Foci', icon: '🥅' },
    { name: 'Technológia', icon: '💻' },
    { name: 'Autók', icon: '🚗' },
    { name: 'Pénzügy', icon: '💰' },
    { name: 'Egészség', icon: '❤️' },
    { name: 'Utazás', icon: '✈️' },
    { name: 'Film & Sorozat', icon: '🎬' },
  ];

  const navItems = [
    { href: '/', label: 'Kezdőlap', icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#9090b0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    )},
    { href: '/discover', label: 'Felfedezés', icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#9090b0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
    )},
    { href: '/trending', label: 'Trendek', icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#9090b0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    )},
    { href: '/friss', label: 'Friss', icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#9090b0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )},
    { href: '/kovetett', label: 'Követett', icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#9090b0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    )},
    { href: '/mentett', label: 'Mentett', icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#9090b0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    )},
    { href: '/notifications', label: 'Értesítések', icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#9090b0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    )},
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
                {item.icon(false)}
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ padding: '20px 20px 8px', fontSize: '12px', color: '#666', letterSpacing: '0.5px' }}>
            TÉMAKÖRÖK
          </div>
          <nav>
            {categories.map((cat) => (
              <Link key={cat.name} href={`/categories/${cat.name.toLowerCase()}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', color: '#c0c0d0',
                textDecoration: 'none', fontSize: '14px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#16161f')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                {cat.name}
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
