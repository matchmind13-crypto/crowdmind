'use client';
import { useState } from 'react';
import { Code2, Check, Copy, ChevronDown } from 'lucide-react';
import { SITE_URL } from '@/lib/publicConfig';

/**
 * Másolható iframe-kód a témához — bloggerek/újságírók így tehetik ki
 * a szavazást a saját cikkükbe. Az ingyenes widget CrowdMind-linket tartalmaz.
 */
export function EmbedCodeBox({ postId, title }: { postId: number; title: string }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  const safeTitle = title.replace(/"/g, "'");
  const src = `${SITE_URL}/embed/${postId}${theme === 'light' ? '?theme=light' : ''}`;
  const code = `<iframe src="${src}" width="100%" height="185" style="border:none;border-radius:14px;max-width:640px" loading="lazy" title="CrowdMind szavazás: ${safeTitle}"></iframe>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // A kijelölés + manuális másolás továbbra is működik.
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-fg-soft transition-colors hover:text-fg"
      >
        <Code2 size={15} className="text-accent-soft" />
        Szavazás beágyazása a saját oldaladba
        <ChevronDown size={15} className={`ml-auto text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-line px-4 py-3.5">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-xs text-muted">Téma:</span>
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  theme === t ? 'bg-accent-strong text-white' : 'bg-card-2 text-muted hover:text-fg-soft'
                }`}
              >
                {t === 'dark' ? 'Sötét' : 'Világos'}
              </button>
            ))}
            <button
              onClick={() => void copy()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-fg-soft transition-colors hover:bg-hover"
            >
              {copied ? <Check size={13} className="text-positive" /> : <Copy size={13} />}
              {copied ? 'Másolva!' : 'Másolás'}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-xl border border-line bg-card-2 p-3 text-xs leading-relaxed text-fg-soft">
            <code>{code}</code>
          </pre>

          <p className="mt-2.5 text-xs text-muted">
            Illeszd be a fenti kódot a cikked vagy blogod HTML-jébe — az élő szavazás-állás jelenik
            meg, kattintásra pedig ide érkeznek az olvasóid. A widget ingyenes, a CrowdMind-logó és
            link a része.
          </p>
        </div>
      )}
    </div>
  );
}
