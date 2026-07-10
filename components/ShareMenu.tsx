'use client';
import { useEffect, useRef, useState } from 'react';
import { Share2, Link as LinkIcon, Check, ChevronDown } from 'lucide-react';

/**
 * Megosztás-menü: link másolása + közvetlen küldés Messengeren, WhatsAppon és X-en.
 * A Messenger mobilon az alkalmazást nyitja (deep link), gépen a Facebook küldő-ablakát.
 */
export function ShareMenu({ url, text }: { url: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setNote(null);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ha a vágólap nem elérhető, a cím kézzel másolható a böngészősávból
    }
  }

  function openShare(target: 'messenger' | 'whatsapp' | 'x') {
    const eUrl = encodeURIComponent(url);
    const eText = encodeURIComponent(`${text}\n${url}`);

    if (target === 'messenger') {
      const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (mobile) {
        // Mobilon a Messenger-app közvetlenül megkapja a linket.
        window.open(`fb-messenger://share/?link=${eUrl}`, '_blank', 'noopener,noreferrer');
        setOpen(false);
        return;
      }
      // Gépen: a linket vágólapra tesszük, és a Messenger új-üzenet oldalát nyitjuk —
      // ott csak a címzettet kell kiválasztani, és beilleszteni (⌘V / Ctrl+V).
      window.open('https://www.messenger.com/new', '_blank', 'noopener,noreferrer');
      void navigator.clipboard.writeText(`${text}\n${url}`).catch(() => undefined);
      setNote('A link a vágólapodon van ✓ — a Messengerben válaszd ki a címzettet, és illeszd be (⌘V).');
      return;
    }

    const href =
      target === 'whatsapp'
        ? `https://wa.me/?text=${eText}`
        : `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${eUrl}`;
    window.open(href, '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          open ? 'border-accent/40 bg-accent-strong/15 text-accent-soft' : 'border-line text-fg-soft hover:bg-hover'
        }`}
      >
        <Share2 size={16} />
        <span className="hidden sm:inline">Megosztás</span>
        <ChevronDown size={13} className={`hidden transition-transform sm:inline ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-60 overflow-hidden rounded-xl border border-line bg-card-2 p-1.5 shadow-2xl shadow-black/50">
          <button
            onClick={() => void copyLink()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-fg-soft transition-colors hover:bg-hover"
          >
            {copied ? <Check size={16} className="shrink-0 text-positive" /> : <LinkIcon size={16} className="shrink-0 text-accent-soft" />}
            {copied ? 'Link másolva! ✓' : 'Link másolása'}
          </button>

          <div className="my-1 border-t border-line" />
          <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Küldés közvetlenül
          </p>

          <button
            onClick={() => openShare('messenger')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-fg-soft transition-colors hover:bg-hover"
          >
            <MessengerIcon />
            Messenger
          </button>
          <button
            onClick={() => openShare('whatsapp')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-fg-soft transition-colors hover:bg-hover"
          >
            <WhatsAppIcon />
            WhatsApp
          </button>
          <button
            onClick={() => openShare('x')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-fg-soft transition-colors hover:bg-hover"
          >
            <XIcon />
            X (Twitter)
          </button>

          {note && (
            <p className="mx-1.5 mb-1 mt-1.5 rounded-lg bg-positive/10 px-2.5 py-2 text-xs leading-relaxed text-positive">
              {note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* Márka-ikonok (egyszerűsített, egyszínű SVG-k) */
function MessengerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0084FF" className="shrink-0" aria-hidden>
      <path d="M12 2C6.5 2 2 6.14 2 11.25c0 2.88 1.42 5.45 3.66 7.14V22l3.35-1.85c.95.26 1.95.4 2.99.4 5.5 0 10-4.14 10-9.25S17.5 2 12 2zm1.06 12.44-2.56-2.73-4.99 2.73 5.49-5.82 2.62 2.72 4.93-2.72-5.49 5.82z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.53 15.2L2 22l4.96-1.44A10 10 0 1 0 12 2zm5.07 14.06c-.22.62-1.28 1.18-1.78 1.22-.48.04-.93.21-3.12-.65-2.64-1.04-4.31-3.73-4.44-3.9-.13-.17-1.06-1.41-1.06-2.69 0-1.28.67-1.91.91-2.17.24-.26.52-.33.69-.33.17 0 .35 0 .5.01.16.01.38-.06.59.45.22.52.74 1.8.8 1.93.07.13.11.29.02.46-.09.17-.13.28-.26.43-.13.15-.28.34-.4.46-.13.13-.27.27-.12.53.15.26.68 1.12 1.46 1.81 1 .89 1.85 1.17 2.11 1.3.26.13.41.11.57-.07.15-.17.65-.76.82-1.02.17-.26.35-.22.59-.13.24.09 1.5.71 1.76.84.26.13.43.19.49.3.06.11.06.62-.16 1.22z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
