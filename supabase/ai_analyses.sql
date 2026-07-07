-- ============================================================
--  CrowdMind – AI-elemzés gyorsítótár (KÖLTSÉGCSÖKKENTÉS!)
--  Ezt másold be a Supabase Dashboard SQL Editorába és futtasd (Run).
--  Idempotens: többször is lefuttatható.
--
--  Mit csinál: egy téma AI-elemzése ide mentődik, és amíg a téma nem
--  változik (nincs új hozzászólás / érdemi szavazat-mozgás), mindenki
--  a tárolt elemzést kapja — így egy témát EGYSZER fizetsz ki, nem
--  minden megnyitáskor. A kód enélkül is működik, csak nem spórol.
-- ============================================================

create table if not exists public.ai_analyses (
  post_id        bigint primary key references public.posts (id) on delete cascade,
  analysis       jsonb not null,
  comments_count integer not null default 0,
  votes_count    integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.ai_analyses enable row level security;

-- Olvasás: bárki (a tárolt elemzés nyilvános tartalom).
drop policy if exists "ai_analyses_select_all" on public.ai_analyses;
create policy "ai_analyses_select_all"
  on public.ai_analyses for select using (true);

-- Írás/frissítés: csak bejelentkezett felhasználó (a szerver a hívó
-- tokenjével ír, és az AI-végpont amúgy is bejelentkezéshez kötött).
drop policy if exists "ai_analyses_insert_auth" on public.ai_analyses;
create policy "ai_analyses_insert_auth"
  on public.ai_analyses for insert to authenticated with check (true);

drop policy if exists "ai_analyses_update_auth" on public.ai_analyses;
create policy "ai_analyses_update_auth"
  on public.ai_analyses for update to authenticated using (true) with check (true);
