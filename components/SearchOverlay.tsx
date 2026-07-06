'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X, User as UserIcon, Layers, MessagesSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchFeedPosts } from '@/lib/postsDb';
import { formatCount } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';
import type { FeedPost } from '@/data/types';

/**
 * Kereső-overlay – VALÓDI keresés:
 * - témák: cím, szöveg, kategória és szerző szerint (kliens-oldali szűrés),
 * - felhasználók: a profiles táblából (ilike),
 * - kategóriák: névre illeszkedő gyorslinkek.
 */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Adatok betöltése egyszer, megnyitáskor
  useEffect(() => {
    fetchFeedPosts().then(setPosts).catch(() => setPosts([]));
    inputRef.current?.focus();
  }, []);

  // Esc zárja
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

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

  const nothing = term.length >= 2 && postHits.length === 0 && users.length === 0 && categoryHits.length === 0 && !searchingUsers;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Keresőmező */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keresés témákra, kérdésekre, véleményekre…"
            className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
          />
          <button onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted hover:bg-hover">
            <X size={16} />
          </button>
        </div>

        {/* Találatok */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {term.length < 2 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Írj be legalább 2 karaktert a kereséshez…
            </p>
          ) : (
            <>
              {categoryHits.length > 0 && (
                <Section title="Kategóriák">
                  <div className="flex flex-wrap gap-2 px-3 pb-2">
                    {categoryHits.map((c) => {
                      const Icon = c.icon;
                      return (
                        <Link
                          key={c.name}
                          href="/discover"
                          onClick={onClose}
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

              {postHits.length > 0 && (
                <Section title={`Témák (${postHits.length})`}>
                  {postHits.map((p) => (
                    <Link
                      key={p.id}
                      href={`/post/${p.id}`}
                      onClick={onClose}
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

              {(users.length > 0 || searchingUsers) && (
                <Section title="Felhasználók">
                  {searchingUsers ? (
                    <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
                      <Loader2 size={13} className="animate-spin" /> Keresés…
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 px-3 pb-2">
                      {users.map((u) => (
                        <span key={u} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card-2 px-3 py-1.5 text-sm text-fg-soft">
                          <UserIcon size={13} className="text-muted" />
                          {u}
                        </span>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {nothing && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  Nincs találat erre: „{q.trim()}”
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
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
