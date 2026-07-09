-- Profilkép: a profiles tábla avatar_url oszlopa.
-- (Maga a képfájl a már meglévő post-media tárolóba kerül, a felhasználó
-- saját mappájába — ahhoz nem kell új szabály.)
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

alter table public.profiles
  add column if not exists avatar_url text;
