-- Tartalom-jelentések: spam / sértő / félrevezető tartalom bejelentése.
-- A jelentéseket az admin a Supabase Table Editorban nézi át (Table Editor → reports).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id bigint not null,
  reason text not null,
  created_at timestamptz not null default now(),
  -- Egy felhasználó egy tartalmat csak egyszer jelenthet.
  unique (reporter_id, target_type, target_id)
);

alter table public.reports enable row level security;

-- Jelenteni bejelentkezve lehet, csak a saját nevedben.
create policy "reports_insert_own" on public.reports
  for insert to authenticated with check (auth.uid() = reporter_id);

-- Mindenki csak a SAJÁT jelentéseit láthatja (a duplikátum-jelzéshez kell).
-- Az összes jelentést csak te látod az admin felületen (Table Editor).
create policy "reports_select_own" on public.reports
  for select to authenticated using (auth.uid() = reporter_id);
