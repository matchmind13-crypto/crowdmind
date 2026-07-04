'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessagesSquare, ChevronDown, ImageIcon, Video, Smile, SlidersHorizontal, User as UserIcon } from 'lucide-react';
import { SortDropdown } from './SortDropdown';
import { CommentList } from './CommentList';
import type { Comment } from '@/data/types';

const SORT_OPTIONS = [
  'Legrelevánsabb',
  'Legújabb',
  'Legtöbb egyetértés',
  'Legmegosztóbb',
  'Legtöbb válasz',
  'AI ajánlott',
  'Hiteles felhasználók',
  'Csak képes hozzászólások',
  'Csak videós hozzászólások',
  'Csak személyes tapasztalatok',
];

export function CollapsibleComments({
  count,
  comments,
}: {
  count: number;
  comments: Comment[];
}) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line panel-gradient">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-strong/25 text-accent-soft ring-1 ring-accent/30">
          <MessagesSquare size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-fg">
            {open ? `Hozzászólások (${count})` : `Hozzászólások megnyitása (${count})`}
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
                  placeholder="Írj véleményt…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
                />
                <div className="flex items-center gap-1 text-muted">
                  <InputIcon icon={ImageIcon} />
                  <InputIcon icon={Video} />
                  <InputIcon icon={Smile} />
                </div>
                <button className="rounded-lg bg-accent-strong px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
                  Küldés
                </button>
              </div>

              <CommentList comments={comments} />

              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card-2 py-2.5 text-sm font-medium text-fg-soft transition-colors hover:bg-hover">
                <SlidersHorizontal size={15} className="text-accent" />
                További hozzászólások betöltése
              </button>
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
