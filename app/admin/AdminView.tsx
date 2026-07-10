'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Inbox, Flag, Trash2, Check, Loader2, Users, FileText,
  MessagesSquare, ThumbsUp, ArrowLeft, ExternalLink, Target, CheckCircle2, XCircle,
} from 'lucide-react';
import { authedFetch } from '@/lib/authedFetch';

interface AdminReport {
  id: number;
  targetType: 'post' | 'comment';
  targetId: number;
  reason: string;
  createdAt: string;
  source?: 'user' | 'ai';
  reporter: string;
  content: { title: string | null; body: string; author: string; postId: number } | null;
}

interface PendingPrediction {
  id: number;
  title: string;
  resolveAt: string;
  yes: number;
  no: number;
}

interface AdminData {
  reports: AdminReport[];
  pendingPredictions?: PendingPrediction[];
  stats: { users: number; posts: number; comments: number; votes: number };
}

/**
 * Admin diszpécserpult: jelentések a kifogásolt tartalommal, egykattintásos
 * döntéssel. Nem-adminnak (és kijelentkezve) 404-szerű oldalt mutat —
 * kifelé nem árulja el, hogy itt bármi van.
 */
export function AdminView() {
  const [data, setData] = useState<AdminData | null>(null);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    try {
      const res = await authedFetch('/api/admin/reports');
      if (!res.ok) { setDenied(true); return; }
      setData(await res.json());
    } catch {
      setDenied(true);
    }
  }

  useEffect(() => { void load(); }, []);

  async function resolvePrediction(postId: number, outcome: 'yes' | 'no') {
    if (busy) return;
    setBusy(postId);
    setMsg(null);
    try {
      const res = await authedFetch('/api/admin/resolve-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, outcome }),
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg(d.error ?? 'A rögzítés nem sikerült.');
      } else {
        setMsg(`Jóslat lezárva (${outcome === 'yes' ? 'bejött' : 'nem jött be'}) — a szavazók értesítést kaptak. ✓`);
        await load();
      }
    } catch {
      setMsg('A rögzítés nem sikerült.');
    }
    setBusy(null);
  }

  async function resolve(reportId: number, action: 'delete' | 'dismiss') {
    if (busy) return;
    setBusy(reportId);
    setMsg(null);
    try {
      const res = await authedFetch('/api/admin/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg(d.error ?? 'A művelet nem sikerült.');
      } else {
        setMsg(action === 'delete' ? 'Tartalom törölve, jelentés lezárva. ✓' : 'Jelentés elutasítva. ✓');
        await load();
      }
    } catch {
      setMsg('A művelet nem sikerült.');
    }
    setBusy(null);
  }

  if (denied) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="text-center">
          <p className="text-5xl font-extrabold text-fg">404</p>
          <p className="mt-2 text-sm text-muted">Ez az oldal nem található.</p>
          <Link href="/" className="mt-5 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Vissza a kezdőlapra
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 size={26} className="animate-spin text-accent-soft" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft">
          <ArrowLeft size={15} />
          CrowdMind
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-strong/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-soft">
          <ShieldCheck size={13} />
          Admin
        </span>
      </div>

      {/* Statisztikák */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Users, value: data.stats.users, label: 'Felhasználó' },
          { icon: FileText, value: data.stats.posts, label: 'Téma' },
          { icon: MessagesSquare, value: data.stats.comments, label: 'Hozzászólás' },
          { icon: ThumbsUp, value: data.stats.votes, label: 'Szavazat' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-2xl border border-line bg-card p-4">
            <Icon size={16} className="text-accent-soft" />
            <p className="mt-2 text-2xl font-bold text-fg">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Lezárásra váró jóslatok */}
      {(data.pendingPredictions ?? []).length > 0 && (
        <>
          <div className="mt-8 mb-3 flex items-center gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-fg">
              <Target size={16} className="text-amber-400" />
              Jóslatok lezárása
            </h2>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
              {(data.pendingPredictions ?? []).length}
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="space-y-3">
            {(data.pendingPredictions ?? []).map((p) => (
              <div key={p.id} className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="font-semibold text-fg">{p.title}</p>
                <p className="mt-1 text-xs text-muted">
                  Lejárt: {new Date(p.resolveAt).toLocaleString('hu-HU')} · a közösség tippje:{' '}
                  <span className="font-semibold text-positive">{p.yes} igen</span> /{' '}
                  <span className="font-semibold text-negative">{p.no} nem</span>
                </p>
                <p className="mt-2 text-xs text-muted">Mi lett a valóság?</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/post/${p.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg-soft transition-colors hover:bg-hover"
                  >
                    <ExternalLink size={13} />
                    Megnézem
                  </Link>
                  <button
                    onClick={() => void resolvePrediction(p.id, 'yes')}
                    disabled={busy === p.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-positive/15 px-3 py-1.5 text-xs font-semibold text-positive transition-colors hover:bg-positive/25 disabled:opacity-50"
                  >
                    {busy === p.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Bejött (IGEN)
                  </button>
                  <button
                    onClick={() => void resolvePrediction(p.id, 'no')}
                    disabled={busy === p.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-negative/15 px-3 py-1.5 text-xs font-semibold text-negative transition-colors hover:bg-negative/25 disabled:opacity-50"
                  >
                    {busy === p.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                    Nem jött be (NEM)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Jelentések */}
      <div className="mt-8 mb-3 flex items-center gap-3">
        <h1 className="flex items-center gap-2 text-base font-bold text-fg">
          <Flag size={16} className="text-negative" />
          Jelentések
        </h1>
        <span className="rounded-full bg-negative/15 px-2 py-0.5 text-xs font-semibold text-negative">
          {data.reports.length}
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {msg && <p className="mb-3 text-sm text-fg-soft">{msg}</p>}

      {data.reports.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={28} className="mx-auto mb-3 text-positive" />
          <p className="text-sm text-fg-soft">Nincs nyitott jelentés — minden tiszta. 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                {r.source === 'ai' && (
                  <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 font-semibold text-accent-soft">
                    🤖 AI-előszűrés
                  </span>
                )}
                <span className="rounded-full bg-negative/15 px-2 py-0.5 font-semibold text-negative">{r.reason}</span>
                <span className="rounded-full bg-card-2 px-2 py-0.5">{r.targetType === 'post' ? 'téma' : 'hozzászólás'}</span>
                <span>jelentette: <span className="text-fg-soft">{r.reporter}</span></span>
                <span>· {new Date(r.createdAt).toLocaleString('hu-HU')}</span>
              </div>

              {r.content ? (
                <div className="mt-3 rounded-xl border border-line bg-card-2/60 p-3">
                  {r.content.title && <p className="font-semibold text-fg">{r.content.title}</p>}
                  {r.content.body && <p className="mt-1 text-sm leading-relaxed text-fg-soft">{r.content.body}</p>}
                  <p className="mt-2 text-xs text-muted">írta: {r.content.author}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">A tartalmat időközben törölték.</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.content && (
                  <Link
                    href={`/post/${r.content.postId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg-soft transition-colors hover:bg-hover"
                  >
                    <ExternalLink size={13} />
                    Megnézem
                  </Link>
                )}
                <button
                  onClick={() => void resolve(r.id, 'delete')}
                  disabled={busy === r.id || !r.content}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-negative/15 px-3 py-1.5 text-xs font-semibold text-negative transition-colors hover:bg-negative/25 disabled:opacity-50"
                >
                  {busy === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Tartalom törlése
                </button>
                <button
                  onClick={() => void resolve(r.id, 'dismiss')}
                  disabled={busy === r.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg-soft transition-colors hover:bg-hover disabled:opacity-50"
                >
                  <Check size={13} />
                  Rendben van, elutasítom
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
