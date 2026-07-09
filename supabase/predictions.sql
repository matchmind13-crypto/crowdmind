-- „Igazam lett" reputáció: jóslat-témák lezárási dátummal és eredménnyel.
-- A resolve_at a szavazási határidő; az outcome-ot ('yes'/'no') az admin rögzíti
-- a határidő után az admin-pulton (a kliens az RLS miatt nem tudja átírni).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

alter table public.posts
  add column if not exists resolve_at timestamptz,
  add column if not exists outcome text check (outcome in ('yes', 'no'));

create index if not exists posts_resolve_idx on public.posts(resolve_at) where resolve_at is not null;
