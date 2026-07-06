'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ChevronDown, ArrowRight, MessagesSquare, Eye, TrendingUp } from 'lucide-react';
import { AIInsightCard, CheckList } from './AIInsightCard';
import { SentimentDonut } from './SentimentDonut';
import { formatCount } from '@/lib/utils';
import type { AISummary } from '@/data/types';

const MIN_COMMENTS_FOR_AI = 20;

export function CollapsibleAIAnalysis({
  ai,
  commentsCount,
  views,
}: {
  ai?: AISummary;
  commentsCount: number;
  views: number;
}) {
  const [open, setOpen] = useState(false);
  const hasAnalysis = commentsCount >= MIN_COMMENTS_FOR_AI && !!ai;

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
              Béta
            </span>
          </span>
          <span className="block truncate text-sm text-muted">
            Részletes AI összefoglaló, kulcsérvek és közösségi hangulat elemzése
          </span>
        </span>
        {open && hasAnalysis && ai && (
          <span className="mr-1 hidden text-xs text-muted sm:block">Frissítve: {ai.updatedAgo}</span>
        )}
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
              {!hasAnalysis || !ai ? (
                <div className="rounded-xl border border-line bg-bg-elevated/70 p-6 text-center">
                  <BrainCircuit size={28} className="mx-auto mb-3 text-accent-soft" />
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-fg-soft">
                    Még kevés hozzászólás érkezett a teljes AI elemzéshez. Amint több vélemény
                    születik, a CrowdMind összefoglalja a közösség álláspontját.
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Az elemzés {MIN_COMMENTS_FOR_AI} hozzászólás felett készül el. Jelenleg: {commentsCount}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <AIInsightCard title="Összegzés" className="md:col-span-1">
                      <p className="text-sm leading-relaxed text-fg-soft">{ai.short}</p>
                    </AIInsightCard>

                    <AIInsightCard title="Érzelmi hangulat" className="md:col-span-2">
                      <div className="flex items-center gap-6">
                        <SentimentDonut {...ai.sentiment} />
                        <div className="space-y-2.5">
                          <LegendRow color="var(--color-positive)" value={ai.sentiment.positive} label="Pozitív" />
                          <LegendRow color="var(--color-neutral)" value={ai.sentiment.neutral} label="Semleges" />
                          <LegendRow color="var(--color-negative)" value={ai.sentiment.negative} label="Negatív" />
                        </div>
                      </div>
                    </AIInsightCard>

                    <AIInsightCard title="Fő témák">
                      <CheckList items={ai.themes} />
                    </AIInsightCard>

                    <AIInsightCard title="Top érvek">
                      <CheckList items={ai.argumentsFor} />
                    </AIInsightCard>

                    <AIInsightCard title="Közösségi aktivitás">
                      <div className="space-y-3">
                        <ActivityRow icon={Eye} value={`${formatCount(views)} megtekintés`} />
                        <ActivityRow icon={MessagesSquare} value={`${formatCount(commentsCount)} hozzászólás`} />
                      </div>
                    </AIInsightCard>
                  </div>

                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-strong to-accent py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    Teljes elemzés megnyitása
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendRow({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-semibold text-fg">{value}%</span>
      <span className="text-muted">{label}</span>
    </div>
  );
}

function ActivityRow({ icon: Icon, value, delta }: { icon: typeof Eye; value: string; delta?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={15} className="text-muted" />
      <span className="text-fg-soft">{value}</span>
      {delta && (
        <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-semibold text-positive">
          <TrendingUp size={12} />
          {delta}
        </span>
      )}
    </div>
  );
}
