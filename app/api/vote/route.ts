import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const body = await request.json()
  const { post_id, vote } = body

  if (!post_id || !vote) {
    return NextResponse.json({ error: 'Missing post_id or vote' }, { status: 400 })
  }

  // Szavazat mentése a votes táblába
  const voteResponse = await fetch(`${supabaseUrl}/rest/v1/votes`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ post_id, vote })
  })

  // yes_votes vagy no_votes frissítése a posts táblában
  const field = vote === 'yes' ? 'yes_votes' : 'no_votes'

  const getPost = await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    }
  })
  const posts = await getPost.json()
  const currentVotes = posts[0][field] || 0

  await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ [field]: currentVotes + 1 })
  })

  return NextResponse.json({ success: true })
}