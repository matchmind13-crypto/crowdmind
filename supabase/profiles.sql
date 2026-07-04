-- ============================================================
--  CrowdMind – "profiles" tábla (felhasználónevek)
--  Ezt az egész blokkot másold be a Supabase Dashboard
--  SQL Editorába (New query), és futtasd le (Run).
--  Nyugodtan lefuttathatod többször is – idempotens.
-- ============================================================

-- 1) A tábla maga.
--    - user_id: a bejelentkezett felhasználó azonosítója (auth.users), egyben elsődleges kulcs.
--      Ha a felhasználót törlik, a profil is automatikusan törlődik (on delete cascade).
--    - username: a választott felhasználónév. NOT NULL + UNIQUE = kötelező és egyedi.
--    - A CHECK constraint garantálja, hogy csak kisbetű/szám/alulvonás legyen, 3–20 karakter
--      (ez egyben azt is jelenti, hogy üres nem lehet).
create table if not exists public.profiles (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  username   text        not null unique,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

-- 2) Row Level Security (RLS) bekapcsolása.
--    Enélkül a tábla alapból zárt (senki nem fér hozzá az anon kulccsal).
alter table public.profiles enable row level security;

-- 3) Olvasási szabály: BÁRKI olvashatja a profilokat.
--    Erre azért van szükség, hogy a regisztrációs űrlap valós időben le tudja
--    kérdezni, hogy egy felhasználónév foglalt-e (ehhez nincs is bejelentkezés).
--    A felhasználónevek amúgy is nyilvánosak (a posztoknál látszanak).
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles
  for select
  using (true);

-- 4) Beszúrási szabály: CSAK a bejelentkezett felhasználó hozhatja létre a SAJÁT profilját.
--    auth.uid() = a bejelentkezett user azonosítója; ennek egyeznie kell a user_id-vel.
--    Így senki nem tud más nevében profilt létrehozni.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 5) (opcionális) Módosítási szabály: mindenki csak a saját profilját módosíthatja.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
