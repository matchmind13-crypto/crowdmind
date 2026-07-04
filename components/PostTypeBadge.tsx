import type { PostType } from '@/data/types';

const META: Record<PostType, { label: string; className: string }> = {
  question:     { label: 'Kérdés',          className: 'bg-accent-strong/20 text-accent-soft ring-accent/30' },
  debate:       { label: 'Vita',            className: 'bg-orange-500/15 text-orange-300 ring-orange-500/30' },
  opinion:      { label: 'Vélemény',        className: 'bg-sky-500/15 text-sky-300 ring-sky-500/30' },
  experience:   { label: 'Tapasztalat',     className: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
  comparison:   { label: 'Összehasonlítás', className: 'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30' },
  poll:         { label: 'Szavazás',        className: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30' },
  media:        { label: 'Média',           className: 'bg-pink-500/15 text-pink-300 ring-pink-500/30' },
  appreciation: { label: 'Appreciation',    className: 'bg-accent-strong/20 text-accent-soft ring-accent/30' },
};

export function PostTypeBadge({ type }: { type: PostType }) {
  const meta = META[type];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
