'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = '#0a0a0f';
  const card = '#16161f';
  const border = '#2a2a3a';
  const purple = '#7c3aed';
  const purpleLight = '#8b5cf6';
  const textPrimary = '#f0f0ff';
  const textSecondary = '#9090b0';
  const textMuted = '#55556a';

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);
  }

  async function markAllRead() {
    await (supabase.from('notifications') as any).update({ read: true }).eq('read', false);
    loadNotifications();
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', color: textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      <div style={{ background: bg, borderBottom: `1px solid ${border}`, padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => window.location.href = '/'} style={{ background: card, border: `1px solid ${border}`, borderRadius: '10px', color: textPrimary, width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}>←</button>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Értesítések</div>
          </div>
          <button onClick={markAllRead} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: '10px', color: purpleLight, padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Mind olvasott</button>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto', paddingBottom: '100px' }}>
        {loading && <div style={{ textAlign: 'center', color: textSecondary, padding: '40px' }}>Betöltés...</div>}
        {!loading && notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Nincsenek értesítések</div>
            <div style={{ fontSize: '14px', color: textSecondary }}>Ha valaki kommentel a posztodra, itt jelenik meg.</div>
          </div>
        )}
        {notifications.map(n => (
          <div key={n.id} style={{ background: n.read ? card : 'rgba(124,58,237,0.1)', border: `1px solid ${n.read ? border : 'rgba(124,58,237,0.3)'}`, borderRadius: '12px', padding: '14px', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: textPrimary, marginBottom: '4px' }}>{n.message}</div>
              <div style={{ fontSize: '12px', color: textMuted }}>{new Date(n.created_at).toLocaleDateString('hu-HU')}</div>
            </div>
            {!n.read && <div style={{ width: '8px', height: '8px', background: purpleLight, borderRadius: '50%', marginTop: '4px' }} />}
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: bg, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 8px 24px', zIndex: 100 }}>
        <button onClick={() => window.location.href = '/'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>🏠</span>Főoldal</button>
        <button onClick={() => window.location.href = '/trending'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>🔥</span>Trending</button>
        <button style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${purple}, ${purpleLight})`, borderRadius: '50%', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(124,58,237,0.5)', marginTop: '-8px' }} onClick={() => window.location.href = '/create'}>+</button>
        <button onClick={() => window.location.href = '/notifications'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: purpleLight, cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>🔔</span>Értesítések</button>
        <button onClick={() => window.location.href = '/profile'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '4px 12px' }}><span style={{ fontSize: '20px' }}>👤</span>Profil</button>
      </div>
    </div>
  );
}