-- Regisztrációs tölcsér: névtelen lépés-számlálók (semmilyen azonosítót nem tárolunk).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create table if not exists public.events (
  id bigint generated always as identity primary key,
  -- A tölcsér lépései (a szerver whitelist-tel is védi):
  name text not null check (
    name in ('latogatas', 'login_oldal', 'regisztracio_szandek', 'regisztracio_kesz', 'temakorok_kesz', 'szavazat')
  ),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Szándékosan NINCS insert/select policy: írni csak a szerver ír bele
-- (/api/event, sebesség-korláttal), olvasni csak az admin pult olvassa.

-- A pult lépésenként + időszakonként számol — ehhez az index:
create index if not exists events_name_created_idx on public.events (name, created_at);
