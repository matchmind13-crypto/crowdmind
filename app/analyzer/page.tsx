'use client';
import { useState } from 'react';
import { Brain, Sparkles, Loader2, MessagesSquare, ThumbsUp, Hash, Scale } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { AIInsightCard, CheckList } from '@/components/AIInsightCard';
import { SentimentDonut } from '@/components/SentimentDonut';
import { usePosts } from '@/lib/usePosts';
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
 * AI elemző – VALÓDI Claude-elemzés: kiválasztasz egy témát, és az AI a
 * tényleges hozzászólások + szavazatok alapján készít részletes összegzést
 * (a /api/summarize végponton keresztül).
 */
export default function AnalyzerPage() {
  const { posts, loading } = usePosts();
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ analysis: Analysis; cached?: boolean; generatedAt?: string; commentsCount: number; votes: { yes: number; no: number } } | null>(null);

  const selected = posts?.find((p) => p.id === selectedId) ?? null;

  async function analyze() {
    if (!selectedId || analyzing) return;
    setAnalyzing(true);
    setError('');
    setResult(null);
    try {
      const res = await authedFetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ismeretlen hiba');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Az elemzés nem sikerült');
    }
    setAnalyzing(false);
  }

  return (
    <AppShell
      right={
        <>
          <PanelCard>
            <PanelHeader title="Hogyan működik?" />
            <ul className="space-y-2.5 px-1 text-sm leading-relaxed text-muted">
              <li>1. Válassz egy témát a listából.</li>
              <li>2. Az AI beolvassa a téma leírását, az összes hozzászólást és a szavazatokat.</li>
              <li>3. Néhány másodperc alatt strukturált elemzést kapsz a közösség álláspontjáról.</li>
            </ul>
          </PanelCard>
          <PanelCard>
            <PanelHeader title="Jó tudni" />
            <p className="flex gap-2 px-1 text-sm leading-relaxed text-muted">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-accent-soft" />
              Az elemzést a Claude (Anthropic) készíti valós időben. Kevés hozzászólásnál az AI
              őszintén jelzi, hogy a kép még nem reprezentatív.
            </p>
          </PanelCard>
        </>
      }
    >
      <PageHeader
        icon={Brain}
        title="AI elemző"
        subtitle="Válassz egy témát, és az AI részletesen elemzi a közösség véleményét"
      />

      {/* Téma-választó + indítás */}
      <div className="rounded-2xl border border-line bg-card p-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Melyik témát elemezzük?
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value ? Number(e.target.value) : ''); setResult(null); setError(''); }}
            disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg focus:border-accent/40 focus:outline-none"
          >
            <option value="">{loading ? 'Témák betöltése…' : 'Válassz témát…'}</option>
            {(posts ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.commentsCount} hozzászólás)
              </option>
            ))}
          </select>
          <button
            onClick={() => void analyze()}
            disabled={!selectedId || analyzing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-strong px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {analyzing ? 'Elemzés folyamatban…' : 'Elemzés indítása'}
          </button>
        </div>

        {selected && !result && !analyzing && (
          <p className="mt-3 text-xs text-muted">
            {selected.category.join(' › ')} · {formatCount(selected.yesVotes + selected.noVotes)} szavazat ·{' '}
            {formatCount(selected.commentsCount)} hozzászólás
          </p>
        )}
        {error && <p className="mt-3 text-sm text-negative">{error}</p>}
      </div>

      {analyzing && (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Loader2 size={28} className="mx-auto mb-3 animate-spin text-accent-soft" />
          <p className="text-sm text-fg-soft">Az AI épp olvassa a hozzászólásokat és összegzi a véleményeket…</p>
          <p className="mt-1 text-xs text-muted">Ez általában 10–30 másodperc.</p>
        </div>
      )}

      {/* Eredmény */}
      {result && (
        <>
          <p className="text-xs text-muted">
            {result.cached
              ? `Tárolt elemzés · készült: ${result.generatedAt ? new Date(result.generatedAt).toLocaleString('hu-HU') : 'korábban'} — új hozzászólásnál automatikusan frissül`
              : 'Frissen készült elemzés'}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <AIInsightCard title="Összegzés" className="md:col-span-1">
              <p className="text-sm leading-relaxed text-fg-soft">{result.analysis.osszegzes}</p>
            </AIInsightCard>

            <AIInsightCard title="Érzelmi hangulat" className="md:col-span-2">
              <div className="flex items-center gap-6">
                <SentimentDonut
                  positive={result.analysis.hangulat.pozitiv}
                  neutral={result.analysis.hangulat.semleges}
                  negative={result.analysis.hangulat.negativ}
                />
                <div className="space-y-2.5 text-sm">
                  <p><span className="font-semibold text-fg">{result.analysis.hangulat.pozitiv}%</span> <span className="text-muted">Pozitív</span></p>
                  <p><span className="font-semibold text-fg">{result.analysis.hangulat.semleges}%</span> <span className="text-muted">Semleges</span></p>
                  <p><span className="font-semibold text-fg">{result.analysis.hangulat.negativ}%</span> <span className="text-muted">Negatív</span></p>
                </div>
              </div>
            </AIInsightCard>

            <AIInsightCard title="Fő álláspontok" className="md:col-span-2">
              <CheckList items={result.analysis.fo_allaspontok} />
            </AIInsightCard>

            <AIInsightCard title="Konszenzus">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-accent-soft" />
                <span className="text-2xl font-bold text-fg">{result.analysis.konszenzus}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent"
                  style={{ width: `${result.analysis.konszenzus}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">Mennyire egységes a közösség véleménye</p>
            </AIInsightCard>

            {result.analysis.vitapontok.length > 0 && (
              <AIInsightCard title="Vitapontok" className="md:col-span-2">
                <ul className="space-y-2">
                  {result.analysis.vitapontok.map((v, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-fg-soft">
                      <Scale size={15} className="mt-0.5 shrink-0 text-neutral" />
                      {v}
                    </li>
                  ))}
                </ul>
              </AIInsightCard>
            )}

            <AIInsightCard title="Kulcsszavak" className={result.analysis.vitapontok.length > 0 ? '' : 'md:col-span-2'}>
              <div className="flex flex-wrap gap-2">
                {result.analysis.kulcsszavak.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 rounded-full border border-line bg-card-2 px-2.5 py-1 text-xs text-fg-soft">
                    <Hash size={11} className="text-accent-soft" />
                    {k}
                  </span>
                ))}
              </div>
            </AIInsightCard>
          </div>

          <AIInsightCard title="Részletes elemzés">
            <p className="text-sm leading-relaxed text-fg-soft">{result.analysis.reszletes}</p>
            <p className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1"><MessagesSquare size={12} /> {result.commentsCount} hozzászólás elemezve</span>
              <span className="inline-flex items-center gap-1"><ThumbsUp size={12} /> {result.votes.yes + result.votes.no} szavazat</span>
            </p>
          </AIInsightCard>
        </>
      )}
    </AppShell>
  );
}
