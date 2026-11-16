'use client';
import Link from 'next/link';
import { ArrowLeft, Plus, Inbox, Layers } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PostCard } from '@/components/PostCard';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { EmbedCodeBox } from '@/components/EmbedCodeBox';
import { usePosts } from '@/lib/usePosts';
import { formatCount } from '@/lib/utils';
import type { PostPageSeoData } from '@/lib/seoPost';

/** Egy poszt saját aloldala – teljes kártya + kapcsolódó témák. Valódi adat. */
export function PostView({ id, ssr }: { id: number; ssr?: PostPageSeoData | null }) {
  const { posts, loading } = usePosts();

  const post = posts?.find((p) => p.id === id) ?? null;
  const related = post
    ? (posts ?? []).filter((p) => p.id !== post.id && p.category[0] === post.category[0]).slice(0, 4)
    : [];
  const categoryCount = post
    ? (posts ?? []).filter((p) => p.category[0] === post.category[0]).length
    : 0;

  return (
    <AppShell
      right={
        post ? (
          <>
            <PanelCard>
              <PanelHeader title={`Továbbiak: ${post.category[0]}`} />
              {related.length === 0 ? (
                <p className="px-1 py-2 text-sm text-muted">Még nincs több téma ebben a kategóriában.</p>
              ) : (
                <div className="space-y-2.5">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/post/${r.id}`}
                      className="block rounded-xl border border-line bg-card-2 px-3 py-2.5 transition-colors hover:bg-hover"
                    >
                      <p className="line-clamp-2 text-sm font-medium text-fg-soft">{r.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatCount(r.yesVotes + r.noVotes)} szavazat · {formatCount(r.commentsCount)} hozzászólás
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </PanelCard>

            <PanelCard>
              <PanelHeader title="Kategória" />
              <div className="flex items-center gap-3 px-1">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-strong/15 text-accent-soft">
                  <Layers size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">{post.category[0]}</p>
                  <p className="text-xs text-muted">{categoryCount} téma összesen</p>
                </div>
              </div>
              <Link
                href="/create"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-strong py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
              >
                <Plus size={15} />
                Új téma indítása
              </Link>
            </PanelCard>
          </>
        ) : undefined
      }
    >
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft">
        <ArrowLeft size={15} />
        Vissza a hírfolyamhoz
      </Link>

      {loading ? (
        ssr ? (
          <StaticPostContent data={ssr} />
        ) : (
          <div className="h-96 animate-pulse rounded-2xl border border-line bg-card" />
        )
      ) : !post ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Ez a téma nem található (lehet, hogy törölték).</p>
        </div>
      ) : (
        <>
          <PostCard post={post} commentsOpen />
          <EmbedCodeBox postId={post.id} title={post.title} />
        </>
      )}
    </AppShell>
  );
}

/** Determinisztikus dátum (UTC) — szerveren és kliensen bájtra ugyanaz, nincs hidratálási eltérés. */
function datumHu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}. ${p(d.getUTCMonth() + 1)}. ${p(d.getUTCDate())}.`;
}

/**
 * Szerver-renderelt tartalom, amíg az interaktív kártya töltődik:
 * a keresők (és a JS nélküli látogatók) így a valódi szöveget és a
 * hozzászólásokat kapják üres csontváz helyett — a felhasználó pedig
 * azonnal olvashatja a kérdést, mielőtt a kliens-adat megérkezne.
 */
function StaticPostContent({ data }: { data: PostPageSeoData }) {
  const { post, authorName, comments } = data;
  return (
    <article className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <p className="text-sm text-muted">{post.category}</p>
      <h1 className="mt-3 text-2xl font-bold leading-snug text-fg">{post.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {authorName ?? 'CrowdMind'} · <time dateTime={post.createdAt}>{datumHu(post.createdAt)}</time> ·{' '}
        {post.yesVotes + post.noVotes} szavazat
      </p>
      {post.description && (
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-fg-soft">{post.description}</p>
      )}
      <section className="mt-6 border-t border-line pt-4">
        <h2 className="text-base font-semibold text-fg">Hozzászólások ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Még nincs hozzászólás — mondd el elsőként a véleményed!</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {comments.map((c, i) => (
              <li key={i} className="rounded-xl border border-line bg-card-2 p-3">
                <p className="text-xs font-semibold text-muted">
                  {c.author} · <time dateTime={c.createdAt}>{datumHu(c.createdAt)}</time>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-fg-soft">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
