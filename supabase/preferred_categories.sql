-- ============================================================
--  CrowdMind – "Egyéni hírfolyam" (preferred_categories)
--  Ezt másold be a Supabase Dashboard SQL Editorába és futtasd (Run).
--  Idempotens: többször is lefuttatható.
-- ============================================================

-- A felhasználó által kiválasztott kategóriák (pl. {'Futball','Technológia'}).
-- text tömb; NULL vagy üres = "nincs egyéni hírfolyam", minden téma látszik.
alter table public.profiles
  add column if not exists preferred_categories text[];

-- Nincs szükség új RLS szabályra: a meglévő "profiles_update_own" policy
-- (auth.uid() = user_id) engedi, hogy a felhasználó a saját sorát frissítse.
