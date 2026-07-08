-- Admin-jogosultság: külön tábla, amit KIZÁRÓLAG SQL-ből lehet tölteni.
-- A kliens csak azt tudja lekérdezni, hogy Ő MAGA admin-e (más sorát nem látja,
-- és írni senki nem tud bele a felületről).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Mindenki csak a SAJÁT admin-státuszát láthatja (a /admin oldal ellenőrzéséhez).
create policy "admins_select_self" on public.admins
  for select to authenticated using (auth.uid() = user_id);

-- SZÁNDÉKOSAN NINCS insert/update/delete szabály: a felületről senki nem
-- teheti magát adminná — admin sort csak itt, SQL-ből lehet felvenni.

-- A matchmind13@gmail.com fiók adminná tétele
-- (előbb regisztrálj ezzel az email-címmel a crowdmind.dev-en, ha még nem tetted!):
insert into public.admins (user_id)
select id from auth.users where email = 'matchmind13@gmail.com'
on conflict (user_id) do nothing;

-- Ellenőrzés: ha ez 1 sort ad vissza, minden rendben.
select u.email, a.created_at as admin_ota
from public.admins a
join auth.users u on u.id = a.user_id;
