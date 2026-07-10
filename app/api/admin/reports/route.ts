import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminServer';

/**
 * Admin: jelentések listája a kifogásolt TARTALOMMAL együtt + oldal-statisztikák.
 * Csak az admins táblában szereplő fiók éri el (lásd lib/adminServer).
 */
export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { admin } = guard;

  try {
    const [{ data: reports }, posts, comments, profiles, votes] = await Promise.all([
      admin.from('reports').select('*').order('created_at', { ascending: false }).limit(100),
      admin.from('posts').select('id', { count: 'exact', head: true }),
      admin.from('comments').select('id', { count: 'exact', head: true }),
      admin.from('profiles').select('user_id', { count: 'exact', head: true }),
      admin.from('votes').select('id', { count: 'exact', head: true }),
    ]);

    const rows = (reports ?? []) as {
      id: number;
      reporter_id: string | null;
      target_type: 'post' | 'comment';
      target_id: number;
      reason: string;
      created_at: string;
      source?: 'user' | 'ai';
    }[];

    // A kifogásolt tartalmak és az érintett felhasználónevek betöltése
    const postIds = [...new Set(rows.filter((r) => r.target_type === 'post').map((r) => r.target_id))];
    const commentIds = [...new Set(rows.filter((r) => r.target_type === 'comment').map((r) => r.target_id))];
    const [postRows, commentRows] = await Promise.all([
      postIds.length > 0
        ? admin.from('posts').select('id,title,description,user_id').in('id', postIds)
        : Promise.resolve({ data: [] as any[] }),
      commentIds.length > 0
        ? admin.from('comments').select('id,content,user_id,post_id').in('id', commentIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const postMap = new Map(((postRows.data ?? []) as any[]).map((p) => [p.id, p]));
    const commentMap = new Map(((commentRows.data ?? []) as any[]).map((c) => [c.id, c]));

    const userIds = [
      ...new Set(
        [
          ...rows.map((r) => r.reporter_id),
          ...[...postMap.values()].map((p: any) => p.user_id),
          ...[...commentMap.values()].map((c: any) => c.user_id),
        ].filter(Boolean),
      ),
    ];
    const { data: nameRows } =
      userIds.length > 0
        ? await admin.from('profiles').select('user_id,username').in('user_id', userIds)
        : { data: [] as any[] };
    const names = new Map(((nameRows ?? []) as any[]).map((p) => [p.user_id, p.username]));

    const enriched = rows.map((r) => {
      const target =
        r.target_type === 'post' ? postMap.get(r.target_id) : commentMap.get(r.target_id);
      return {
        id: r.id,
        targetType: r.target_type,
        targetId: r.target_id,
        reason: r.reason,
        createdAt: r.created_at,
        source: r.source ?? 'user',
        reporter:
          r.source === 'ai'
            ? 'AI-moderáció (automatikus előszűrés)'
            : (r.reporter_id && names.get(r.reporter_id)) || 'ismeretlen',
        content: target
          ? r.target_type === 'post'
            ? { title: target.title, body: String(target.description ?? '').slice(0, 300), author: names.get(target.user_id) ?? 'ismeretlen', postId: target.id }
            : { title: null, body: String(target.content ?? '').slice(0, 300), author: names.get(target.user_id) ?? 'ismeretlen', postId: target.post_id }
          : null, // a tartalmat időközben törölték
      };
    });

    // Lezárásra váró jóslatok: a határidő letelt, de még nincs eredmény.
    let pendingPredictions: { id: number; title: string; resolveAt: string; yes: number; no: number }[] = [];
    try {
      const { data: preds } = await admin
        .from('posts')
        .select('id,title,resolve_at,yes_votes,no_votes')
        .not('resolve_at', 'is', null)
        .is('outcome', null)
        .lte('resolve_at', new Date().toISOString())
        .order('resolve_at', { ascending: true });
      const rows = (preds ?? []) as any[];
      if (rows.length > 0) {
        const { data: voteRows } = await admin
          .from('votes')
          .select('post_id,vote')
          .in('post_id', rows.map((p) => p.id));
        const counts = new Map<number, { yes: number; no: number }>();
        ((voteRows ?? []) as any[]).forEach((v) => {
          if (v.vote !== 'yes' && v.vote !== 'no') return;
          const c = counts.get(v.post_id) ?? { yes: 0, no: 0 };
          if (v.vote === 'yes') c.yes += 1; else c.no += 1;
          counts.set(v.post_id, c);
        });
        pendingPredictions = rows.map((p) => ({
          id: p.id,
          title: p.title,
          resolveAt: p.resolve_at,
          yes: (p.yes_votes ?? 0) + (counts.get(p.id)?.yes ?? 0),
          no: (p.no_votes ?? 0) + (counts.get(p.id)?.no ?? 0),
        }));
      }
    } catch {
      // az oszlopok még nem léteznek — jóslat-szekció nélkül megyünk
    }

    // Visszajelzések (a "Visszajelzés küldése" gombból) — tábla híján üres lista.
    let feedbacks: { id: number; message: string; page: string | null; createdAt: string; from: string }[] = [];
    try {
      const { data: fb } = await admin
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      const fbRows = (fb ?? []) as any[];
      const fbUserIds = [...new Set(fbRows.map((f) => f.user_id).filter(Boolean))];
      const { data: fbNames } =
        fbUserIds.length > 0
          ? await admin.from('profiles').select('user_id,username').in('user_id', fbUserIds)
          : { data: [] as any[] };
      const fbNameMap = new Map(((fbNames ?? []) as any[]).map((p) => [p.user_id, p.username]));
      feedbacks = fbRows.map((f) => ({
        id: f.id,
        message: String(f.message ?? ''),
        page: f.page ?? null,
        createdAt: f.created_at,
        from: (f.user_id && fbNameMap.get(f.user_id)) || f.email || 'névtelen látogató',
      }));
    } catch {
      // a feedback tábla még nem létezik
    }

    // Regisztrációs tölcsér: lépésenkénti számlálók (7 nap + összes) — tábla híján üres.
    const FUNNEL_STEPS = [
      'latogatas',
      'login_oldal',
      'regisztracio_szandek',
      'regisztracio_kesz',
      'temakorok_kesz',
      'szavazat',
    ];
    let funnel: { step: string; last7: number; total: number }[] = [];
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const counts = await Promise.all(
        FUNNEL_STEPS.flatMap((step) => [
          admin.from('events').select('id', { count: 'exact', head: true }).eq('name', step),
          admin
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('name', step)
            .gte('created_at', weekAgo),
        ]),
      );
      if (!counts.some((c) => c.error)) {
        funnel = FUNNEL_STEPS.map((step, i) => ({
          step,
          total: counts[i * 2].count ?? 0,
          last7: counts[i * 2 + 1].count ?? 0,
        }));
      }
    } catch {
      // az events tábla még nem létezik
    }

    return NextResponse.json({
      reports: enriched,
      pendingPredictions,
      feedbacks,
      funnel,
      stats: {
        users: profiles.count ?? 0,
        posts: posts.count ?? 0,
        comments: comments.count ?? 0,
        votes: votes.count ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Nem sikerült betölteni a jelentéseket.' }, { status: 500 });
  }
}
