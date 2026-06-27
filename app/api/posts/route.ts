import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing env vars', url: supabaseUrl, key: supabaseKey ? 'exists' : 'missing' }, { status: 500 })
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/posts?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    }
  })

  const data = await response.json()
  return NextResponse.json(data)
}