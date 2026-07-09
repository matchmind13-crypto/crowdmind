'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UsersRound, Users, Plus, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { fetchGroups, createGroup, resetGroupsCache, type GroupInfo } from '@/lib/groups';
import { usePosts } from '@/lib/usePosts';

/** Csoport-könyvtár: az összes csoport + új csoport létrehozása. */
export function GroupsDirectory() {
  const { posts } = usePosts();
  const [groups, setGroups] = useState<GroupInfo[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    resetGroupsCache();
    setGroups(await fetchGroups());
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate() {
    if (busy || !name.trim()) return;
    setBusy(true);
    setMsg(null);
    const res = await createGroup(name, desc);
    if (res.ok) {
      setMsg({ text: `A(z) „${res.group?.name}” csoport létrejött — te vagy az első tagja! 🎉`, ok: true });
      setName('');
      setDesc('');
      setCreating(false);
      await load();
    } else {
      setMsg({ text: res.error ?? 'Hiba történt.', ok: false });
    }
    setBusy(false);
  }

  const topicCount = (id: number) => (posts ?? []).filter((p) => p.groupId === id).length;

  return (
    <AppShell
      right={
        <PanelCard>
          <PanelHeader title="Mi a csoport?" />
          <p className="px-1 text-sm leading-relaxed text-muted">
            A csoport egy téma köré gyűlt közösség — pl. „Budapesti albérlők” vagy „Fradi-szurkolók”.
            Bárki létrehozhat egyet, a posztok a csoport neve alatt jelennek meg, és a tagok együtt
            vitatkoznak. A csoport adatai (létrehozó, dátum, taglétszám) nyilvánosak.
          </p>
        </PanelCard>
      }
    >
      <PageHeader
        icon={UsersRound}
        title="Csoportok"
        subtitle="Böngéssz a közösségek közt, csatlakozz — vagy alapíts sajátot"
        action={
          <button
            onClick={() => { setCreating((c) => !c); setMsg(null); }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-strong px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            <Plus size={15} />
            Új csoport
          </button>
        }
      />

      {/* Létrehozó űrlap */}
      {creating && (
        <div className="rounded-2xl border border-accent/30 bg-accent-strong/5 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-fg">
            <Sparkles size={15} className="text-accent-soft" />
            Új csoport alapítása
          </p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 40))}
            placeholder="Csoport neve (pl. Budapesti albérlők)"
            className="mt-3 w-full rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value.slice(0, 300))}
            placeholder="Miről szól a csoport? (opcionális, max 300 karakter)"
            rows={2}
            className="mt-2 w-full resize-y rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => void handleCreate()}
              disabled={busy || name.trim().length < 3}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Csoport létrehozása
            </button>
            <button
              onClick={() => { setCreating(false); setMsg(null); }}
              className="rounded-xl border border-line px-4 py-2.5 text-sm text-fg-soft transition-colors hover:bg-hover"
            >
              Mégse
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p className={`text-sm ${msg.ok ? 'text-positive' : 'text-negative'}`}>{msg.text}</p>
      )}

      {/* Csoport-lista */}
      {groups === null ? (
        <>
          <div className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
          <div className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
        </>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <UsersRound size={30} className="mx-auto mb-3 text-accent-soft" />
          <p className="text-sm text-fg-soft">Még nincs egyetlen csoport sem.</p>
          <p className="mt-1 text-xs text-muted">Alapítsd meg te az elsőt — a te neved lesz a létrehozónál!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/csoport/${encodeURIComponent(g.name)}`}
              className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition-colors hover:bg-hover"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-strong/15 text-accent-soft">
                <UsersRound size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{g.name}</p>
                {g.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{g.description}</p>}
                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Users size={12} /> {g.members} tag</span>
                  <span>· {topicCount(g.id)} téma</span>
                  <span>· {new Date(g.createdAt).toLocaleDateString('hu-HU')}</span>
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
