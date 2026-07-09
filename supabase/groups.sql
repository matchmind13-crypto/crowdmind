-- VALÓDI csoportok: felhasználók által létrehozott, névvel bíró közösségek.
-- A posztok opcionálisan egy csoporthoz köthetők (posts.group_id).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create table if not exists public.groups (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 3 and 40),
  description text,
  creator_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;

-- A csoportok nyilvánosak (bárki böngészheti őket).
create policy "groups_select" on public.groups
  for select using (true);

-- Csoportot bejelentkezve, a saját nevedben hozhatsz létre.
create policy "groups_insert_own" on public.groups
  for insert to authenticated with check (auth.uid() = creator_id);

-- Tagságok: ki melyik csoportnak tagja.
create table if not exists public.group_members (
  group_id bigint not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "group_members_select" on public.group_members
  for select using (true);

create policy "group_members_insert_own" on public.group_members
  for insert to authenticated with check (auth.uid() = user_id);

create policy "group_members_delete_own" on public.group_members
  for delete to authenticated using (auth.uid() = user_id);

-- A posztok csoporthoz köthetők; a csoport törlésekor a poszt megmarad (csoport nélkül).
alter table public.posts
  add column if not exists group_id bigint references public.groups(id) on delete set null;

create index if not exists posts_group_idx on public.posts(group_id) where group_id is not null;
