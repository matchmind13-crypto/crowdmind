-- AI-moderáció: az automatikus előszűrő jelentései is a reports táblába kerülnek.
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

-- 1) Az AI-jelentésnek nincs emberi bejelentője.
alter table public.reports alter column reporter_id drop not null;

-- 2) Honnan jött a jelentés: 'user' (Jelentés gomb) vagy 'ai' (automatikus előszűrő).
alter table public.reports
  add column if not exists source text not null default 'user'
  check (source in ('user', 'ai'));

-- 3) Egy tartalomról az AI csak egy jelentést tehet (a felhasználói limitet
--    a meglévő unique (reporter_id, target_type, target_id) már kezeli).
create unique index if not exists reports_ai_one_per_target
  on public.reports (target_type, target_id)
  where source = 'ai';
