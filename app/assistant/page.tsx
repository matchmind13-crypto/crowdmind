'use client';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Loader2, User as UserIcon, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { authedFetch } from '@/lib/authedFetch';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Milyen témák vannak most a platformon?',
  'Melyik a legvitatottabb téma?',
  'Foglald össze a foci témák állását!',
  'Hogyan működik a CrowdMind?',
];

/**
 * AI asszisztens – VALÓDI chat a Claude-dal (/api/assistant).
 * A beszélgetés csak ebben a lapfülben él (nem mentjük el).
 */
export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setError('');
    const next: ChatMsg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await authedFetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ismeretlen hiba');
      setMessages((m) => [...m, { role: 'assistant', content: String(data.reply ?? '') }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Az asszisztens nem elérhető');
    }
    setBusy(false);
  }

  return (
    <AppShell
      right={
        <>
          <PanelCard>
            <PanelHeader title="Mire jó?" />
            <ul className="space-y-2.5 px-1 text-sm leading-relaxed text-muted">
              <li>• Kérdezhetsz a platform témáiról és azok állásáról</li>
              <li>• Összefoglaltathatod a közösség véleményét</li>
              <li>• Segít eligazodni a CrowdMind működésében</li>
            </ul>
          </PanelCard>
          <PanelCard>
            <PanelHeader title="Jó tudni" />
            <p className="px-1 text-sm leading-relaxed text-muted">
              Az asszisztens a Claude (Anthropic) modellel fut, és látja a platform friss témáit.
              A beszélgetés nem mentődik el – az oldal frissítésével törlődik.
            </p>
          </PanelCard>
        </>
      }
    >
      <PageHeader
        icon={Sparkles}
        title="AI asszisztens"
        subtitle="Kérdezz bármit a platform témáiról – azonnali, valódi AI-válaszokkal"
        action={
          messages.length > 0 ? (
            <button
              onClick={() => { setMessages([]); setError(''); }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-card-2 px-3.5 py-2 text-sm font-medium text-fg-soft transition-colors hover:bg-hover"
            >
              <Trash2 size={14} className="text-muted" />
              Új beszélgetés
            </button>
          ) : undefined
        }
      />

      {/* Beszélgetés */}
      <div className="flex min-h-[480px] flex-col rounded-2xl border border-line bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && !busy && (
            <div className="py-10 text-center">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent-strong/20 text-accent-soft ring-1 ring-accent/30">
                <Sparkles size={26} />
              </span>
              <p className="text-sm font-medium text-fg">Szia! Miben segíthetek? 👋</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
                Kérdezz a témákról, vagy válassz az alábbi javaslatokból:
              </p>
              <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="rounded-full border border-line bg-card-2 px-3 py-1.5 text-xs text-fg-soft transition-colors hover:border-accent/40 hover:bg-hover"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ${
                  m.role === 'user'
                    ? 'bg-hover text-muted ring-line'
                    : 'bg-accent-strong/20 text-accent-soft ring-accent/30'
                }`}
              >
                {m.role === 'user' ? <UserIcon size={15} /> : <Sparkles size={15} />}
              </span>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-accent-strong text-white'
                    : 'border border-line bg-card-2 text-fg-soft'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-strong/20 text-accent-soft ring-1 ring-accent/30">
                <Sparkles size={15} />
              </span>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-card-2 px-4 py-2.5 text-sm text-muted">
                <Loader2 size={14} className="animate-spin" />
                Gondolkodom…
              </div>
            </div>
          )}

          {error && <p className="text-center text-sm text-negative">{error}</p>}
          <div ref={bottomRef} />
        </div>

        {/* Bevitel */}
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-bg-elevated px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void send(input); }}
              placeholder="Írd be a kérdésed…"
              disabled={busy}
              className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
            />
            <button
              onClick={() => void send(input)}
              disabled={busy || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Send size={14} />
              Küldés
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
