-- Csoport-moderáció: a létrehozó szerkesztheti a leírást és kitűzhet egy témát.
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

begin;

-- Kitűzött téma a csoport tetején (törölt posztnál magától null-ra áll).
alter table public.groups
  add column if not exists pinned_post_id bigint references public.posts(id) on delete set null;

-- A létrehozó frissítheti a SAJÁT csoportját (leírás, kitűzés).
drop policy if exists "groups_update_creator" on public.groups;
create policy "groups_update_creator" on public.groups
  for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

commit;

-- Ellenőrzés: 1 sor (az oszlop) + 1 sor (a policy) jelenik meg.
select column_name
  from information_schema.columns
 where table_schema = 'public' and table_name = 'groups' and column_name = 'pinned_post_id';
select policyname from pg_policies
 where schemaname = 'public' and tablename = 'groups' and policyname = 'groups_update_creator';
