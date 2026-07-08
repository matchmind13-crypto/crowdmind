'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { exportMyData, deleteMyAccount } from '@/lib/gdpr';
import { PanelCard, PanelHeader } from './PanelCard';

/** GDPR-panel a profilon: adatexport, tájékoztató, fiók végleges törlése. */
export function AccountDataPanel() {
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [delStep, setDelStep] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [delError, setDelError] = useState<string | null>(null);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setExportMsg(null);
    const res = await exportMyData();
    setExportMsg(res.ok ? 'Letöltés elindítva. 📦' : (res.error ?? 'Hiba történt.'));
    setExporting(false);
  }

  async function handleDelete() {
    setDelStep('deleting');
    setDelError(null);
    const res = await deleteMyAccount();
    if (res.ok) {
      window.location.href = '/?torolve=1';
      return;
    }
    setDelError(res.error ?? 'A törlés nem sikerült.');
    setDelStep('confirm');
  }

  return (
    <PanelCard>
      <PanelHeader title="Adataid és adatvédelem" />
      <div className="space-y-2.5 px-1">
        <button
          onClick={() => void handleExport()}
          disabled={exporting}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card-2 py-2.5 text-sm font-medium text-fg-soft transition-colors hover:bg-hover disabled:opacity-60"
        >
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} className="text-accent-soft" />}
          Adataim letöltése (JSON)
        </button>
        {exportMsg && <p className="text-center text-xs text-muted">{exportMsg}</p>}

        <Link
          href="/privacy"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card-2 py-2.5 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
        >
          <ShieldCheck size={15} className="text-accent-soft" />
          Adatkezelési tájékoztató
        </Link>

        <div className="border-t border-line pt-2.5">
          {delStep === 'idle' && (
            <button
              onClick={() => setDelStep('confirm')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-negative/30 py-2.5 text-sm font-medium text-negative transition-colors hover:bg-negative/10"
            >
              <Trash2 size={15} />
              Fiók végleges törlése
            </button>
          )}

          {delStep !== 'idle' && (
            <div className="rounded-xl border border-negative/30 bg-negative/5 p-3">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-fg-soft">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-negative" />
                Ez MINDENT töröl: a fiókod, a témáid, hozzászólásaid, szavazataid és mentéseid.
                Nem vonható vissza. Ha biztos vagy, írd be: <span className="font-bold text-negative">TÖRLÉS</span>
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="TÖRLÉS"
                disabled={delStep === 'deleting'}
                className="mt-2.5 w-full rounded-lg border border-line bg-bg-elevated px-3 py-2 text-sm text-fg focus:outline-none"
              />
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={() => void handleDelete()}
                  disabled={confirmText !== 'TÖRLÉS' || delStep === 'deleting'}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-negative/15 py-2 text-sm font-semibold text-negative transition-colors hover:bg-negative/25 disabled:opacity-40"
                >
                  {delStep === 'deleting' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {delStep === 'deleting' ? 'Törlés…' : 'Végleges törlés'}
                </button>
                <button
                  onClick={() => { setDelStep('idle'); setConfirmText(''); setDelError(null); }}
                  disabled={delStep === 'deleting'}
                  className="flex-1 rounded-lg border border-line py-2 text-sm text-fg-soft transition-colors hover:bg-hover"
                >
                  Mégse
                </button>
              </div>
              {delError && <p className="mt-2 text-xs text-negative">{delError}</p>}
            </div>
          )}
        </div>
      </div>
    </PanelCard>
  );
}
