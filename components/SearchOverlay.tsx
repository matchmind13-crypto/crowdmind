'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search, X, User as UserIcon, Layers, MessagesSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchFeedPosts } from '@/lib/postsDb';
import { formatCount } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';
import type { FeedPost } from '@/data/types';

/**
 * Kereső-logika és találat-panel — két megjelenéssel:
 * - asztali: a fejléc keresősávja alatt lenyíló panel (a sáv a helyén marad),
 * - mobil: teljes képernyős overlay (portállal, a billentyűzethez igazítva).
 */
const RECENT_KEY = 'crowdmind_recent_searches';

export function useSearch() {
  const [q, setQ] = useState('');
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const activated = useRef(false);

  // Keresési előzmények betöltése (csak a te böngésződben tárolódnak)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch { /* privát mód */ }
  }, []);

  /** A posztok betöltése — lustán, az első fókusznál/megnyitásnál.
   *  Hiba esetén nem ragad be: a következő fókusz/gépelés újrapróbálja. */
  function activate() {
    if (activated.current) return;
    activated.current = true;
    fetchFeedPosts()
      .then(setPosts)
      .catch(() => { activated.current = false; });
  }

  function saveRecent(t: string) {
    const v = t.trim();
    if (v.length < 2) return;
    setRecents((prev) => {
      const next = [v, ...prev.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 8);
      try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* privát mód */ }
      return next;
    });
  }

  function removeRecent(t: string) {
    setRecents((prev) => {
      const next = prev.filter((x) => x !== t);
      try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* privát mód */ }
      return next;
    });
  }

  // Felhasználó-keresés (debounce-olt, valódi DB-lekérdezés)
  useEffect(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) { setUsers([]); return; }
    setSearchingUsers(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', `%${term}%`)
        .limit(6);
      setUsers(((data ?? []) as { username: string }[]).map((u) => u.username));
      setSearchingUsers(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const term = q.trim().toLowerCase();

  const postHits = useMemo(() => {
    if (!posts || term.length < 2) return [];
    return posts
      .filter((p) =>
        p.title.toLowerCase().includes(term) ||
        p.body.some((b) => b.toLowerCase().includes(term)) ||
        p.category.some((c) => c.toLowerCase().includes(term)) ||
        p.authorName.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [posts, term]);

  const categoryHits = useMemo(
    () => (term.length < 2 ? [] : CATEGORIES.filter((c) => c.name.toLowerCase().includes(term))),
    [term],
  );

  const loadingPosts = posts === null;
  const nothing = term.length >= 2 && !loadingPosts && postHits.length === 0 && users.length === 0 && categoryHits.length === 0 && !searchingUsers;

  return { q, setQ, term, recents, saveRecent, removeRecent, activate, postHits, users, searchingUsers, categoryHits, nothing, loadingPosts };
}

export type SearchState = ReturnType<typeof useSearch>;

/** A találat-lista (előzmények / kategóriák / témák / felhasználók) — közös mindkét nézetben. */
export function SearchResults({ s, onNavigate }: { s: SearchState; onNavigate: () => void }) {
  return s.term.length < 2 ? (
    s.recents.length > 0 ? (
      <Section title="Előzmények">
        {s.recents.map((r) => (
          <div key={r} className="group flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-hover">
            <Search size={14} className="shrink-0 text-muted" />
            <button
              onClick={() => s.setQ(r)}
              className="min-w-0 flex-1 truncate text-left text-sm text-fg-soft"
            >
              {r}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); s.removeRecent(r); }}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-negative/15 hover:text-negative"
              aria-label={`„${r}” törlése az előzményekből`}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </Section>
    ) : (
      <p className="px-3 py-6 text-center text-sm text-muted">
        Írj be legalább 2 karaktert a kereséshez…
      </p>
    )
  ) : (
    <>
      {s.categoryHits.length > 0 && (
        <Section title="Kategóriák">
          <div className="flex flex-wrap gap-2 px-3 pb-2">
            {s.categoryHits.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.name}
                  href="/discover"
                  onClick={onNavigate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card-2 px-3 py-1.5 text-sm text-fg-soft hover:border-accent/40 hover:bg-hover"
                >
                  <Icon size={14} className="text-accent-soft" />
                  {c.name}
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {s.postHits.length > 0 && (
        <Section title={`Témák (${s.postHits.length})`}>
          {s.postHits.map((p) => (
            <Link
              key={p.id}
              href={`/post/${p.id}`}
              onClick={onNavigate}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-hover"
            >
              <Layers size={15} className="mt-0.5 shrink-0 text-accent-soft" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg">{p.title}</span>
                <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <span>{p.category[0]}</span>
                  <span className="inline-flex items-center gap-1"><ThumbsUp size={11} /> {formatCount(p.yesVotes + p.noVotes)}</span>
                  <span className="inline-flex items-center gap-1"><MessagesSquare size={11} /> {formatCount(p.commentsCount)}</span>
                </span>
              </span>
            </Link>
          ))}
        </Section>
      )}

      {(s.users.length > 0 || s.searchingUsers) && (
        <Section title="Felhasználók">
          {s.searchingUsers ? (
            <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
              <Loader2 size={13} className="animate-spin" /> Keresés…
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 px-3 pb-2">
              {s.users.map((u) => (
                <Link
                  key={u}
                  href={`/user/${encodeURIComponent(u)}`}
                  onClick={onNavigate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card-2 px-3 py-1.5 text-sm text-fg-soft hover:border-accent/40 hover:bg-hover"
                >
                  <UserIcon size={13} className="text-muted" />
                  {u}
                </Link>
              ))}
            </div>
          )}
        </Section>
      )}

      {s.loadingPosts && s.postHits.length === 0 && (
        <p className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> Témák betöltése…
        </p>
      )}

      {s.nothing && (
        <p className="px-3 py-6 text-center text-sm text-muted">
          Nincs találat erre: „{s.q.trim()}”
        </p>
      )}
    </>
  );
}

/** Mobil: teljes képernyős kereső-overlay (portállal a body-ra). */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const s = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    s.activate();
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function navigate() {
    s.saveRecent(s.q);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={s.q}
            onChange={(e) => s.setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') s.saveRecent(s.q); }}
            placeholder="Keresés témákra, kérdésekre, véleményekre…"
            className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
          />
          <button onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted hover:bg-hover">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          <SearchResults s={s} onNavigate={navigate} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{title}</p>
      {children}
    </div>
  );
}
