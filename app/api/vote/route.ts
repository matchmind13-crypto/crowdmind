import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing auth token' }, { status: 401 })
  }

  const body = await request.json()
  const { post_id, vote, user_id } = body

  if (!post_id || !vote || !user_id) {
    return NextResponse.json({ error: 'Missing post_id, vote or user_id' }, { status: 400 })
  }

  // Jóslat-őr: a lezárási időpont után (vagy eldöntött eredménynél) nincs több szavazat.
  try {
    const guardRes = await fetch(
      `${supabaseUrl}/rest/v1/posts?id=eq.${post_id}&select=resolve_at,outcome`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
    )
    const guardRows = await guardRes.json()
    const guard = Array.isArray(guardRows) ? guardRows[0] : null
    if (guard?.outcome || (guard?.resolve_at && new Date(guard.resolve_at).getTime() <= Date.now())) {
      return NextResponse.json({ error: 'Ez a jóslat lezárult — már nem lehet rá szavazni.' }, { status: 403 })
    }
  } catch {
    // ha az oszlopok még nem léteznek, a szavazás a régi módon megy tovább
  }

  const voteResponse = await fetch(`${supabaseUrl}/rest/v1/votes`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ post_id, vote, user_id })
  })

  if (!voteResponse.ok) {
    const errorData = await voteResponse.json()
    if (errorData.code === '23505') {
      return NextResponse.json({ error: 'Már szavaztál erre a posztra', code: '23505' }, { status: 409 })
    }
    return NextResponse.json({ error: errorData.message || 'Hiba a szavazás mentésekor' }, { status: 500 })
  }

  const field = vote === 'yes' ? 'yes_votes' : 'no_votes'

  const getPost = await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  const posts = await getPost.json()
  const currentValue = posts[0]?.[field] || 0

  await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ [field]: currentValue + 1 })
  })

  return NextResponse.json({ success: true })
}
