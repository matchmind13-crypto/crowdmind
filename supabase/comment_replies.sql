-- Komment-válaszok (szálazott vita): a comments tábla parent_id oszlopa.
-- Ha egy hozzászólást törölnek, a rá adott válaszok is törlődnek (cascade).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

alter table public.comments
  add column if not exists parent_id bigint references public.comments(id) on delete cascade;

create index if not exists comments_parent_id_idx on public.comments(parent_id);
