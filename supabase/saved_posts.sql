-- ============================================================
--  CrowdMind – fiókhoz kötött mentések (saved_posts)
--  Ezt másold be a Supabase Dashboard SQL Editorába és futtasd (Run).
--  Idempotens: többször is lefuttatható.
--
--  Mit csinál: a "Mentés" gombbal elmentett posztok a fiókodhoz
--  kötődnek, így minden eszközödön ugyanazok. Amíg nem fut le,
--  a mentések a böngészőben tárolódnak (mint eddig).
-- ============================================================

create table if not exists public.saved_posts (
  user_id    uuid   not null references auth.users (id) on delete cascade,
  post_id    bigint not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.saved_posts enable row level security;

-- Mindenki csak a SAJÁT mentéseit láthatja és kezelheti.
drop policy if exists "saved_select_own" on public.saved_posts;
create policy "saved_select_own"
  on public.saved_posts for select to authenticated using (auth.uid() = user_id);

drop policy if exists "saved_insert_own" on public.saved_posts;
create policy "saved_insert_own"
  on public.saved_posts for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "saved_delete_own" on public.saved_posts;
create policy "saved_delete_own"
  on public.saved_posts for delete to authenticated using (auth.uid() = user_id);
