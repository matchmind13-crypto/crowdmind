'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessagesSquare, ChevronDown, ImageIcon, Video, Smile, User as UserIcon, Loader2 } from 'lucide-react';
import { SortDropdown } from './SortDropdown';
import { CommentList } from './CommentList';
import { fetchComments, addComment } from '@/lib/postsDb';
import type { FeedComment } from '@/data/types';

const SORT_OPTIONS = ['Legújabb', 'Legrégebbi'];

export function CollapsibleComments({ postId, count }: { postId: number; count: number }) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [comments, setComments] = useState<FeedComment[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<{ msg: string; needsLogin?: boolean } | null>(null);
  const [added, setAdded] = useState(0);

  const displayCount = count + added;

  async function load() {
    setLoadError('');
    try {
      setComments(await fetchComments(postId));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Hiba a betöltéskor');
      setComments([]);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && comments === null) void load();
  }

  async function submit() {
    if (!text.trim() || posting) return;
    setPosting(true);
    setPostError(null);
    const res = await addComment(postId, text);
    if (!res.ok) {
      setPostError({ msg: res.error ?? 'Hiba a küldéskor', needsLogin: res.needsLogin });
      setPosting(false);
      return;
    }
    setText('');
    setAdded((a) => a + 1);
    await load(); // friss lista (a saját nevünkkel együtt)
    setPosting(false);
  }

  const sorted = comments
    ? sort === 'Legrégebbi' ? [...comments].reverse() : comments
    : null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line panel-gradient">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-strong/25 text-accent-soft ring-1 ring-accent/30">
          <MessagesSquare size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-fg">
            {open ? `Hozzászólások (${displayCount})` : `Hozzászólások megnyitása (${displayCount})`}
          </span>
          <span className="block truncate text-sm text-muted">
            Olvasd el a közösség véleményeit és csatlakozz a beszélgetéshez
          </span>
        </span>
        <ChevronDown size={20} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="border-t border-line px-4 pb-4 pt-4">
              <SortDropdown options={SORT_OPTIONS} value={sort} onChange={setSort} />

              {/* Komment input */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-bg-elevated px-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-hover text-muted ring-1 ring-line">
                  <UserIcon size={16} />
                </span>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }}
                  placeholder="Írj véleményt…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
                />
                <div className="hidden items-center gap-1 text-muted sm:flex">
                  <InputIcon icon={ImageIcon} />
                  <InputIcon icon={Video} />
                  <InputIcon icon={Smile} />
                </div>
                <button
                  onClick={() => void submit()}
                  disabled={posting || !text.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent-strong px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
                >
                  {posting && <Loader2 size={14} className="animate-spin" />}
                  Küldés
                </button>
              </div>

              {postError && (
                <p className="mt-2 text-sm text-negative">
                  {postError.msg}{' '}
                  {postError.needsLogin && (
                    <Link href="/login" className="font-semibold text-accent-soft underline">
                      Bejelentkezés
                    </Link>
                  )}
                </p>
              )}

              {loadError && <p className="mt-3 text-sm text-negative">{loadError}</p>}

              {sorted === null ? (
                <div className="mt-4 space-y-3">
                  <div className="h-20 animate-pulse rounded-xl bg-card-2/60" />
                  <div className="h-20 animate-pulse rounded-xl bg-card-2/60" />
                </div>
              ) : (
                <CommentList
                  comments={sorted}
                  postId={postId}
                  onDeleted={() => { setAdded((a) => a - 1); void load(); }}
                  onReplied={() => { setAdded((a) => a + 1); void load(); }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputIcon({ icon: Icon }: { icon: typeof ImageIcon }) {
  return (
    <button className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-hover hover:text-fg-soft">
      <Icon size={17} />
    </button>
  );
}
