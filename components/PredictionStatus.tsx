'use client';
import { useEffect, useState } from 'react';
import { Target, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Jóslat-státusz banner a poszton:
 * - nyitva: meddig lehet szavazni,
 * - lejárt, eredmény nélkül: "eredményre vár",
 * - eldöntve: mi lett + a bejelentkezett felhasználó személyes találata.
 */
export function PredictionStatus({
  postId,
  resolveAt,
  outcome,
}: {
  postId: number;
  resolveAt: string | null;
  outcome: 'yes' | 'no' | null;
}) {
  const [myVote, setMyVote] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    if (!outcome) return; // a személyes találat csak eldöntött jóslatnál érdekes
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('votes')
        .select('vote')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (active && data) {
        const v = (data as any).vote;
        if (v === 'yes' || v === 'no') setMyVote(v);
      }
    })();
    return () => { active = false; };
  }, [postId, outcome]);

  if (!resolveAt && !outcome) return null;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('hu-HU', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const closed = resolveAt ? new Date(resolveAt).getTime() <= Date.now() : false;

  // Eldöntött jóslat
  if (outcome) {
    const iWasRight = myVote !== null && myVote === outcome;
    return (
      <div className={`mt-4 rounded-xl border p-3.5 ${outcome === 'yes' ? 'border-positive/30 bg-positive/5' : 'border-negative/30 bg-negative/5'}`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          {outcome === 'yes' ? (
            <CheckCircle2 size={17} className="text-positive" />
          ) : (
            <XCircle size={17} className="text-negative" />
          )}
          A jóslat eldőlt: {outcome === 'yes' ? 'BEJÖTT (igen)' : 'NEM JÖTT BE (nem)'}
        </p>
        {myVote !== null && (
          <p className={`mt-1.5 text-sm font-medium ${iWasRight ? 'text-positive' : 'text-muted'}`}>
            {iWasRight
              ? '🎯 Igazad lett! Ez a találat a profilodon is megjelenik.'
              : 'Most nem jött össze — a következőnél tiéd a pálya.'}
          </p>
        )}
      </div>
    );
  }

  // Lejárt, de még nincs eredmény
  if (closed) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-sm text-fg-soft">
        <Hourglass size={16} className="shrink-0 text-amber-400" />
        A szavazás lezárult — az eredmény rögzítésére vár. Hamarosan kiderül, kinek lett igaza!
      </div>
    );
  }

  // Még nyitva
  return (
    <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-sm text-fg-soft">
      <Target size={16} className="shrink-0 text-amber-400" />
      <span>
        🎯 Jóslat — szavazni <span className="font-semibold text-fg">{fmt(resolveAt!)}</span>-ig lehet.
        Aki eltalálja, „Igazam lett" találatot kap.
      </span>
    </div>
  );
}
