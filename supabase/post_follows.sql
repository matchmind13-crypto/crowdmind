-- Téma-szintű követés: aki követ egy posztot, értesítést kap minden új hozzászólásról.
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create table if not exists public.post_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.post_follows enable row level security;

-- Bárki (bejelentkezve) láthatja, ki követ egy témát — ez kell ahhoz,
-- hogy hozzászóláskor a kommentelő kliense értesíthesse a követőket.
create policy "post_follows_select" on public.post_follows
  for select to authenticated using (true);

-- Követni csak a saját nevedben lehet.
create policy "post_follows_insert_own" on public.post_follows
  for insert to authenticated with check (auth.uid() = user_id);

-- Kikövetni is csak magadat tudod.
create policy "post_follows_delete_own" on public.post_follows
  for delete to authenticated using (auth.uid() = user_id);
