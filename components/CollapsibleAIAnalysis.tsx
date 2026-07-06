'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ChevronDown, Sparkles, Loader2, Hash, Scale, MessagesSquare, Eye } from 'lucide-react';
import { AIInsightCard, CheckList } from './AIInsightCard';
import { SentimentDonut } from './SentimentDonut';
import { authedFetch } from '@/lib/authedFetch';
import { formatCount } from '@/lib/utils';

interface Analysis {
  osszegzes: string;
  reszletes: string;
  fo_allaspontok: string[];
  vitapontok: string[];
  hangulat: { pozitiv: number; semleges: number; negativ: number };
  kulcsszavak: string[];
  konszenzus: number;
}

/**
 * Lenyitható AI-elemzés a posztok alatt – VALÓDI Claude-elemzéssel.
 * A lenyitás ingyenes; maga az elemzés gombnyomásra készül el
 * (bejelentkezéshez kötött, hogy a kereted védve legyen).
 */
export function CollapsibleAIAnalysis({
  postId,
  commentsCount,
  views,
}: {
  postId: number;
  commentsCount: number;
  views: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<{ msg: string; needsLogin?: boolean } | null>(null);

  async function analyze() {
    if (loading || analysis) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ msg: data.error ?? 'Az elemzés nem sikerült', needsLogin: res.status === 401 });
        setLoading(false);
        return;
      }
      setAnalysis(data.analysis);
    } catch {
      setError({ msg: 'Az elemzés nem sikerült. Próbáld újra!' });
    }
    setLoading(false);
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-line panel-gradient">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-strong/25 text-accent-soft ring-1 ring-accent/30">
          <BrainCircuit size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-base font-semibold text-fg">
              {open ? 'AI elemzés' : 'AI elemzés megnyitása'}
            </span>
            <span className="rounded-md bg-accent-strong/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-soft">
              Claude
            </span>
          </span>
          <span className="block truncate text-sm text-muted">
            Részletes AI összefoglaló, kulcsérvek és közösségi hangulat elemzése
          </span>
        </span>
        <ChevronDown size={20} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="border-t border-line p-4">
              {!analysis && !loading && (
                <div className="rounded-xl border border-line bg-bg-elevated/70 p-6 text-center">
                  <BrainCircuit size={28} className="mx-auto mb-3 text-accent-soft" />
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-fg-soft">
                    Az AI a téma összes hozzászólását és szavazatát elolvassa, majd összefoglalja
                    a közösség álláspontját.
                  </p>
                  <button
                    onClick={() => void analyze()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-strong to-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Sparkles size={15} />
                    Elemzés készítése (10–30 mp)
                  </button>
                  {error && (
                    <p className="mt-3 text-sm text-negative">
                      {error.msg}{' '}
                      {error.needsLogin && (
                        <Link href="/login" className="font-semibold text-accent-soft underline">
                          Bejelentkezés
                        </Link>
                      )}
                    </p>
                  )}
                </div>
              )}

              {loading && (
                <div className="rounded-xl border border-line bg-bg-elevated/70 p-6 text-center">
                  <Loader2 size={26} className="mx-auto mb-3 animate-spin text-accent-soft" />
                  <p className="text-sm text-fg-soft">Az AI épp olvassa a hozzászólásokat…</p>
                </div>
              )}

              {analysis && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <AIInsightCard title="Összegzés" className="md:col-span-1">
                    <p className="text-sm leading-relaxed text-fg-soft">{analysis.osszegzes}</p>
                  </AIInsightCard>

                  <AIInsightCard title="Érzelmi hangulat" className="md:col-span-2">
                    <div className="flex items-center gap-6">
                      <SentimentDonut
                        positive={analysis.hangulat.pozitiv}
                        neutral={analysis.hangulat.semleges}
                        negative={analysis.hangulat.negativ}
                      />
                      <div className="space-y-2.5 text-sm">
                        <p><span className="font-semibold text-fg">{analysis.hangulat.pozitiv}%</span> <span className="text-muted">Pozitív</span></p>
                        <p><span className="font-semibold text-fg">{analysis.hangulat.semleges}%</span> <span className="text-muted">Semleges</span></p>
                        <p><span className="font-semibold text-fg">{analysis.hangulat.negativ}%</span> <span className="text-muted">Negatív</span></p>
                      </div>
                    </div>
                  </AIInsightCard>

                  <AIInsightCard title="Fő álláspontok" className="md:col-span-2">
                    <CheckList items={analysis.fo_allaspontok} />
                  </AIInsightCard>

                  <AIInsightCard title="Konszenzus">
                    <div className="flex items-center gap-2">
                      <Scale size={16} className="text-accent-soft" />
                      <span className="text-2xl font-bold text-fg">{analysis.konszenzus}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent"
                        style={{ width: `${analysis.konszenzus}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted">Mennyire egységes a vélemény</p>
                  </AIInsightCard>

                  {analysis.vitapontok.length > 0 && (
                    <AIInsightCard title="Vitapontok" className="md:col-span-2">
                      <ul className="space-y-2">
                        {analysis.vitapontok.map((v, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-fg-soft">
                            <Scale size={15} className="mt-0.5 shrink-0 text-neutral" />
                            {v}
                          </li>
                        ))}
                      </ul>
                    </AIInsightCard>
                  )}

                  <AIInsightCard title="Kulcsszavak" className={analysis.vitapontok.length > 0 ? '' : 'md:col-span-2'}>
                    <div className="flex flex-wrap gap-2">
                      {analysis.kulcsszavak.map((k) => (
                        <span key={k} className="inline-flex items-center gap-1 rounded-full border border-line bg-card-2 px-2.5 py-1 text-xs text-fg-soft">
                          <Hash size={11} className="text-accent-soft" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </AIInsightCard>

                  <AIInsightCard title="Részletes elemzés" className="md:col-span-3">
                    <p className="text-sm leading-relaxed text-fg-soft">{analysis.reszletes}</p>
                    <p className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1"><MessagesSquare size={12} /> {formatCount(commentsCount)} hozzászólás</span>
                      <span className="inline-flex items-center gap-1"><Eye size={12} /> {formatCount(views)} megtekintés</span>
                    </p>
                  </AIInsightCard>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
