import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminServer';

/** Admin: egy visszajelzés lezárása (törlése) — POST { id }. */
export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Hibás kérés.' }, { status: 400 });
  }

  const { error } = await guard.admin.from('feedback').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
