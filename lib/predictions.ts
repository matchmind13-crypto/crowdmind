import { supabase } from './supabase';

/**
 * „Igazam lett" mérleg: az eldöntött jóslatokon hány tippje jött be a
 * felhasználónak. Nem kell hozzá külön pont-tábla — a votes és a posts.outcome
 * összevetéséből számolódik, mindig pontosan.
 */
export async function fetchPredictionRecord(
  userId: string,
): Promise<{ correct: number; total: number } | null> {
  try {
    const { data: resolved, error } = await supabase
      .from('posts')
      .select('id,outcome')
      .not('outcome', 'is', null);
    if (error) return null; // az oszlop még nem létezik
    const rows = (resolved ?? []) as { id: number; outcome: string }[];
    if (rows.length === 0) return { correct: 0, total: 0 };

    const { data: votes } = await supabase
      .from('votes')
      .select('post_id,vote')
      .eq('user_id', userId)
      .in('post_id', rows.map((r) => r.id));
    const outcomes = new Map(rows.map((r) => [r.id, r.outcome]));
    let correct = 0;
    let total = 0;
    ((votes ?? []) as { post_id: number; vote: string }[]).forEach((v) => {
      if (v.vote !== 'yes' && v.vote !== 'no') return;
      total += 1;
      if (outcomes.get(v.post_id) === v.vote) correct += 1;
    });
    return { correct, total };
  } catch {
    return null;
  }
}
