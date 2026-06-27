import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const body = await request.json()
  const { title, description, category } = body

  if (!title || !category) {
    return NextResponse.json({ error: 'Title and category required' }, { status: 400 })
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/posts`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      title,
      description,
      category,
      yes_votes: 0,
      no_votes: 0
    })
  })

  const data = await response.json()
  return NextResponse.json(data)
}