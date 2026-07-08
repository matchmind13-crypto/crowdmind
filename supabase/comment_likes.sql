-- Komment-lájkok: a legjobb érvek felül jelennek meg.
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create table if not exists public.comment_likes (
  comment_id bigint not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

-- A lájk-számok mindenkinek látszanak (kijelentkezve is).
create policy "comment_likes_select" on public.comment_likes
  for select using (true);

-- Lájkolni csak a saját nevedben lehet.
create policy "comment_likes_insert_own" on public.comment_likes
  for insert to authenticated with check (auth.uid() = user_id);

-- A lájkot visszavonni is csak magadnak tudod.
create policy "comment_likes_delete_own" on public.comment_likes
  for delete to authenticated using (auth.uid() = user_id);
