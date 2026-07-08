'use client';
import { useEffect, useRef, useState } from 'react';
import { Flag, MoreHorizontal, Loader2, Check } from 'lucide-react';
import { submitReport, REPORT_REASONS } from '@/lib/reports';

/**
 * Jelentés gomb más felhasználók tartalmára (poszt vagy komment).
 * `variant="menu"`: „..." gomb legördülővel (PostCard),
 * `variant="flag"`: kis zászló ikon (kommentsor).
 */
export function ReportButton({
  targetType,
  targetId,
  variant = 'menu',
}: {
  targetType: 'post' | 'comment';
  targetId: number;
  variant?: 'menu' | 'flag';
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'pick' | 'sending' | 'done'>('pick');
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setState('pick');
        setMsg(null);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function send(reason: string) {
    setState('sending');
    const res = await submitReport(targetType, targetId, reason);
    if (res.ok) {
      setMsg('Köszönjük! A jelentést megkaptuk, hamarosan átnézzük.');
    } else if (res.already) {
      setMsg('Ezt már jelentetted — köszönjük!');
    } else if (res.needsLogin) {
      setMsg('A jelentéshez jelentkezz be.');
    } else if (res.unavailable) {
      setMsg('A jelentés funkció hamarosan elérhető.');
    } else {
      setMsg('Nem sikerült elküldeni — próbáld újra később.');
    }
    setState('done');
  }

  return (
    <div className="relative" ref={ref}>
      {variant === 'menu' ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-hover hover:text-fg-soft"
          aria-label="További műveletek"
        >
          <MoreHorizontal size={18} />
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-hover hover:text-fg-soft"
          aria-label="Hozzászólás jelentése"
        >
          <Flag size={13} />
          Jelentés
        </button>
      )}

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-60 overflow-hidden rounded-xl border border-line bg-card-2 p-1.5 shadow-2xl shadow-black/50">
          {state === 'pick' && (
            <>
              <p className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <Flag size={12} className="text-negative" />
                Miért jelented?
              </p>
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => void send(r)}
                  className="block w-full rounded-lg px-2.5 py-2 text-left text-sm text-fg-soft transition-colors hover:bg-hover"
                >
                  {r}
                </button>
              ))}
            </>
          )}
          {state === 'sending' && (
            <p className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" /> Küldés…
            </p>
          )}
          {state === 'done' && (
            <p className="flex items-start gap-2 px-2.5 py-2 text-sm text-fg-soft">
              <Check size={15} className="mt-0.5 shrink-0 text-positive" />
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
