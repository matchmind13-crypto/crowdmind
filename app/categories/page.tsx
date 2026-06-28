'use client';
import { useState, useEffect } from 'react';

const categories = [
  { name: 'Foci', emoji: '⚽', color: '#10b981' },
  { name: 'Lakhatás', emoji: '🏠', color: '#8b5cf6' },
  { name: 'Politika', emoji: '🏛️', color: '#ef4444' },
  { name: 'Tech', emoji: '💻', color: '#3b82f6' },
  { name: 'Egyéb', emoji: '💬', color: '#f59e0b' },
];

export default function Categories() {
  const bg = '#0a0a0f';
  const card = '#16161f';
  const border = '#2a2a3a';
  const purple = '#7c3aed';
  const purpleLight = '#8b5cf6';
  const textPrimary = '#f0f0ff';
  const textSecondary = '#9090b0';

  return (
    <div style={{ background: bg, minHeight: '100vh', color: textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      <div style={{ background: bg, borderBottom: `1px solid ${border}`, padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => window.location.href = '/'} style={{ background: card, border: `1px solid ${border}`, borderRadius: '10px', color: textPrimary, width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}>←</button>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>Kategóriák</div>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto', paddingBottom: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {categories.map(cat => (
            <div key={cat.name} onClick={() => window.location.href = `/?category=${cat.name}`} style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px 16px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.emoji}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: textPrimary }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: bg, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 8px 24px', zIndex: 100 }}>
        <button onClick={() => window.location.href = '/'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#55556a', cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>🏠</span>Főoldal</button>
        <button onClick={() => window.location.href = '/trending'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#55556a', cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>🔥</span>Trending</button>
        <button style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${purple}, ${purpleLight})`, borderRadius: '50%', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(124,58,237,0.5)', marginTop: '-8px' }} onClick={() => window.location.href = '/create'}>+</button>
        <button onClick={() => window.location.href = '/trending'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#55556a', cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>🔔</span>Értesítések</button>
        <button onClick={() => window.location.href = '/profile'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: purpleLight, cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>👤</span>Profil</button>
      </div>
    </div>
  );
}