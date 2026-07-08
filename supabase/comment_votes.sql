-- Komment dislike: a comment_likes tábla vote oszlopa (1 = lájk, -1 = dislike).
-- A meglévő sorok automatikusan lájknak számítanak (default 1).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

alter table public.comment_likes
  add column if not exists vote smallint not null default 1 check (vote in (1, -1));

-- A lájk↔dislike váltáshoz kell: mindenki a SAJÁT szavazatát módosíthatja.
drop policy if exists "comment_likes_update_own" on public.comment_likes;
create policy "comment_likes_update_own" on public.comment_likes
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
