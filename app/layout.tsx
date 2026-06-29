'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="hu">
      <body style={{ background: '#0a0a0f', minHeight: '100vh', color: '#f0f0ff', margin: 0 }}>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          />
        )}

        <div style={{
          position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-280px',
          width: '280px', height: '100vh', background: '#16161f',
          zIndex: 50, transition: 'left 0.3s ease', padding: '20px 0', overflowY: 'auto'
        }}>
          <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #2d2d3d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>CrowdMind</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
          </div>

          <nav style={{ padding: '16px 0' }}>
            {[
              { href: '/', icon: '🏠', label: 'Főoldal' },
              { href: '/trending', icon: '🔥', label: 'Trending' },
              { href: '/categories', icon: '📂', label: 'Kategóriák' },
              { href: '/create', icon: '➕', label: 'Új vita' },
              { href: '/notifications', icon: '🔔', label: 'Értesítések' },
              { href: '/profile', icon: '👤', label: 'Profil' },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 24px', color: '#f0f0ff', textDecoration: 'none',
                fontSize: '16px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2d2d3d')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed', top: '16px', left: '16px', zIndex: 30,
            background: '#16161f', border: '1px solid #2d2d3d',
            borderRadius: '8px', padding: '8px 10px', cursor: 'pointer',
            color: '#f0f0ff', fontSize: '18px'
          }}
        >
          ☰
        </button>

        {children}
      </body>
    </html>
  );
}
