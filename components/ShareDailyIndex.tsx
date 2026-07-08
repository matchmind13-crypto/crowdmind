'use client';
import { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';
import { SITE_URL } from '@/lib/publicConfig';

/** Megosztás gomb a napi indexhez: natív megosztás, ha van, különben link-másolás. */
export function ShareDailyIndex({ pct, day }: { pct: number; day: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${SITE_URL}/ma`;
    const text = `A magyar közösség hangulata ma: ${pct}% pozitív (${day}) — CrowdMind napi közhangulat-index`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'CrowdMind napi közhangulat-index', text, url });
        return;
      }
    } catch {
      // a felhasználó bezárta a megosztási panelt — nem hiba
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ha a vágólap sem megy, a cím kézzel is másolható
    }
  }

  return (
    <button
      onClick={() => void share()}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-strong px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? 'Link másolva!' : 'Megosztom a mai indexet'}
    </button>
  );
}

/** Kisegítő: csak a link másolása. */
export function CopyIndexLink() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/ma`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* kézzel is másolható */ }
  }
  return (
    <button
      onClick={() => void copy()}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-card-2 px-5 py-3 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
    >
      {copied ? <Check size={15} className="text-positive" /> : <LinkIcon size={15} />}
      {copied ? 'Másolva!' : 'crowdmind.dev/ma'}
    </button>
  );
}
