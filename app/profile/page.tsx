'use client';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    async function getUser() {
      const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`
        }
      })
      const data = await res.json()
      setUser(data)
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleLogout() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`
      }
    })
    window.location.href = '/login'
  }

  if (loading) return <div style={{ padding: 20 }}>Betöltés...</div>

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      <h1>Profilom</h1>
      {user?.email ? (
        <>
          <p style={{ marginBottom: 20 }}>📧 {user.email}</p>
          <p style={{ marginBottom: 20, color: '#666' }}>
            Tag óta: {new Date(user.created_at).toLocaleDateString('hu-HU')}
          </p>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: 12, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Kijelentkezés
          </button>
        </>
      ) : (
        <div>
          <p>Nem vagy bejelentkezve.</p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{ width: '100%', padding: 12, backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Bejelentkezés
          </button>
        </div>
      )}
    </div>
  )
}