'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Minus, ChartLine, ChevronDown } from 'lucide-react';
import { castVote } from '@/lib/postsDb';
import { OpinionTimeline } from './OpinionTimeline';
import { formatCount } from '@/lib/utils';

/**
 * "Közösség egy pillantásban" – a CrowdMind ikonikus eleme.
 * A Mellette / Ellene gombokkal valódi szavazat adható le (fejenként egy).
 */
export function CommunitySnapshot({
  postId,
  yesVotes,
  noVotes,
  neutralVotes = 0,
  commentsCount,
  locked = false,
}: {
  postId: number;
  yesVotes: number;
  noVotes: number;
  neutralVotes?: number;
  commentsCount: number;
  /** Lezárt jóslatnál true — a szavazás-gombok tiltva. */
  locked?: boolean;
}) {
  const [yes, setYes] = useState(yesVotes);
  const [no, setNo] = useState(noVotes);
  const [neutral, setNeutral] = useState(neutralVotes);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; needsLogin?: boolean } | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const total = yes + no + neutral;
  const forPct = total > 0 ? Math.round((yes / total) * 100) : 0;
  const neutralPct = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const againstPct = total > 0 ? Math.max(0, 100 - forPct - neutralPct) : 0;
  // A sávnak és az aránynak MINDIG látszania kell — a szavazatszám mellette
  // teszi átláthatóvá, hogy ez 1 vagy 100 szavazatból jött ki. Csak a szó szerint
  // üres (0 szavazat) állapotnál mutatunk hívogató szöveget bár helyette.
  const isEmpty = total === 0;

  async function vote(v: 'yes' | 'no' | 'neutral') {
    if (busy) return;
    if (locked) {
      setMsg({ text: 'Ez a jóslat lezárult — már nem lehet rá szavazni.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    // Az új állás kiszámítása a szavazat UTÁN — ez kerül az értesítésbe.
    const nYes = yes + (v === 'yes' ? 1 : 0);
    const nTotal = total + 1;
    const standing = `${Math.round((nYes / nTotal) * 100)}% mellette (${nTotal} szavazat)`;
    const res = await castVote(postId, v, standing);
    if (res.ok) {
      if (v === 'yes') setYes((n) => n + 1);
      else if (v === 'no') setNo((n) => n + 1);
      else setNeutral((n) => n + 1);
      setMsg({ text: 'Szavazatod rögzítve. Köszönjük!' });
    } else if (res.already) {
      setMsg({ text: 'Erre a posztra már szavaztál.' });
    } else if (res.needsLogin) {
      setMsg({ text: 'A szavazáshoz jelentkezz be.', needsLogin: true });
    } else {
      setMsg({ text: res.error ?? 'Hiba a szavazáskor.' });
    }
    setBusy(false);
  }

  return (
    <div className="mt-4 rounded-xl border border-line bg-bg-elevated/60 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Közösség egy pillantásban
        </span>
        <span className="text-xs text-muted">
          {formatCount(total)} szavazat · {formatCount(commentsCount)} hozzászólás
        </span>
      </div>

      {/* Arány-sáv: zöld (mellette) / szürke (semleges) / piros (ellene) — mindig a valós
          arányt mutatja, akár egyetlen szavazatból is (a szám mellette jelzi a mintaméretet). */}
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-line">
        {!isEmpty && (
          <>
            <div className="bg-positive transition-all" style={{ width: `${forPct}%` }} />
            <div className="bg-zinc-500/80 transition-all" style={{ width: `${neutralPct}%` }} />
            <div className="bg-negative transition-all" style={{ width: `${againstPct}%` }} />
          </>
        )}
      </div>

      {isEmpty && (
        <p className="mt-2 text-center text-xs text-accent-soft">
          Legyél az elsők között, akik szavaznak — a te voksod indítja el a mérleget!
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between text-xs">
        <button
          onClick={() => void vote('yes')}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-positive/10 disabled:opacity-60"
        >
          <ThumbsUp size={13} className="text-positive" />
          {!isEmpty && <span className="font-semibold text-fg">{forPct}%</span>}
          <span className="text-muted">Mellette</span>
        </button>
        <button
          onClick={() => void vote('neutral')}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-hover disabled:opacity-60"
        >
          <Minus size={13} className="text-zinc-400" />
          {!isEmpty && <span className="font-semibold text-fg">{neutralPct}%</span>}
          <span className="text-muted">{locked ? 'Lezárult' : 'Semleges'}</span>
        </button>
        <button
          onClick={() => void vote('no')}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-negative/10 disabled:opacity-60"
        >
          <ThumbsDown size={13} className="text-negative" />
          {!isEmpty && <span className="font-semibold text-fg">{againstPct}%</span>}
          <span className="text-muted">Ellene</span>
        </button>
      </div>

      {msg && (
        <p className="mt-2 text-center text-xs text-fg-soft">
          {msg.text}{' '}
          {msg.needsLogin && (
            <Link href="/login" className="font-semibold text-accent-soft underline">
              Bejelentkezés
            </Link>
          )}
        </p>
      )}

      {/* Vélemény-idővonal – lenyitásra töltődik */}
      <button
        onClick={() => setTimelineOpen((o) => !o)}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 border-t border-line pt-2.5 text-xs font-medium text-muted transition-colors hover:text-accent-soft"
      >
        <ChartLine size={13} className="text-accent-soft" />
        Vélemény-idővonal
        <ChevronDown size={13} className={`transition-transform ${timelineOpen ? 'rotate-180' : ''}`} />
      </button>
      {timelineOpen && <OpinionTimeline postId={postId} />}
    </div>
  );
}
