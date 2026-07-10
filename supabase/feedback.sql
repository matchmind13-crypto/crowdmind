-- Visszajelzések: a "Visszajelzés küldése" gomb üzenetei (hibák, ötletek).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  -- Bejelentkezett küldőnél a fiók; névtelen küldésnél null.
  user_id uuid references auth.users(id) on delete set null,
  -- Névtelen küldő opcionális válasz-címe.
  email text,
  message text not null check (char_length(message) between 3 and 2000),
  -- Melyik oldalról küldték (útvonal).
  page text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Szándékosan NINCS insert/select policy: írni csak a szerver ír bele
-- (service-kulccsal, a /api/feedback végponton át, sebesség-korláttal),
-- olvasni pedig csak az admin pult olvassa. Így REST-ből nem spamelhető.
