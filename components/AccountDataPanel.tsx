'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Trash2, Loader2, AlertTriangle, Mail } from 'lucide-react';
import { exportMyData, deleteMyAccount } from '@/lib/gdpr';
import { supabase } from '@/lib/supabase';
import { PanelCard, PanelHeader } from './PanelCard';

/** GDPR-panel a profilon: email-értesítések, adatexport, tájékoztató, fiók törlése. */
export function AccountDataPanel() {
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [delStep, setDelStep] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [delError, setDelError] = useState<string | null>(null);
  // Email-értesítések kapcsolója — amíg a migráció (email_notifications oszlop)
  // nincs lefuttatva, a sor egyszerűen nem jelenik meg.
  const [emailPref, setEmailPref] = useState<boolean | null>(null);
  const [prefBusy, setPrefBusy] = useState(false);
  const [prefMsg, setPrefMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!active || error || !data) return; // oszlop/sor híján a kapcsoló rejtve marad
      setEmailPref(((data as any).email_notifications as boolean | null) ?? true);
    })();
    return () => { active = false; };
  }, []);

  async function toggleEmailPref() {
    if (prefBusy || emailPref === null) return;
    setPrefBusy(true);
    setPrefMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPrefMsg('A módosításhoz jelentkezz be újra.'); return; }
      const next = !emailPref;
      const { error } = await (supabase.from('profiles') as any)
        .update({ email_notifications: next })
        .eq('user_id', session.user.id);
      if (error) { setPrefMsg('A mentés nem sikerült — próbáld újra később.'); return; }
      setEmailPref(next);
      setPrefMsg(next ? 'Email-értesítések bekapcsolva. ✓' : 'Email-értesítések kikapcsolva.');
    } catch {
      setPrefMsg('Váratlan hiba — ellenőrizd a netkapcsolatot, és próbáld újra.');
    } finally {
      setPrefBusy(false);
    }
  }

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setExportMsg(null);
    try {
      const res = await exportMyData();
      setExportMsg(res.ok ? 'Letöltés elindítva. 📦' : (res.error ?? 'Hiba történt.'));
    } catch {
      setExportMsg('Váratlan hiba — ellenőrizd a netkapcsolatot, és próbáld újra.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDelStep('deleting');
    setDelError(null);
    try {
      const res = await deleteMyAccount();
      if (res.ok) {
        window.location.href = '/?torolve=1';
        return;
      }
      setDelError(res.error ?? 'A törlés nem sikerült.');
      setDelStep('confirm');
    } catch {
      setDelError('Váratlan hiba — ellenőrizd a netkapcsolatot, és próbáld újra.');
      setDelStep('confirm');
    }
  }

  return (
    <PanelCard>
      <PanelHeader title="Adataid és adatvédelem" />
      <div className="space-y-2.5 px-1">
        {emailPref !== null && (
          <div className="rounded-xl border border-line bg-card-2 px-3 py-2.5">
            <button
              onClick={() => void toggleEmailPref()}
              disabled={prefBusy}
              className="flex w-full items-center justify-between gap-2 text-sm disabled:opacity-60"
            >
              <span className="flex items-center gap-2 font-medium text-fg-soft">
                <Mail size={15} className="text-accent-soft" />
                Email-értesítések
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${emailPref ? 'bg-accent-strong' : 'bg-line'}`}
                aria-hidden
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${emailPref ? 'left-[18px]' : 'left-0.5'}`}
                />
              </span>
            </button>
            <p className="mt-1 text-xs text-muted">
              Levél, ha válaszolnak a hozzászólásodra, vagy eldől egy jóslatod.
            </p>
            {prefMsg && <p className="mt-1 text-xs text-accent-soft">{prefMsg}</p>}
          </div>
        )}

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
