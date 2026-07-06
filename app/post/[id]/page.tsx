'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Inbox, Layers } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PostCard } from '@/components/PostCard';
import { PanelCard, PanelHeader } from '@/components/PanelCard';
import { usePosts } from '@/lib/usePosts';
import { formatCount } from '@/lib/utils';

/** Egy poszt saját aloldala – teljes kártya + kapcsolódó témák. Valódi adat. */
export default function PostPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
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
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-card" />
      ) : !post ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <Inbox size={30} className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-fg-soft">Ez a téma nem található (lehet, hogy törölték).</p>
        </div>
      ) : (
        <PostCard post={post} />
      )}
    </AppShell>
  );
}
