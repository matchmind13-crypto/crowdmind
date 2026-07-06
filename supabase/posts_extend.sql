-- ============================================================
--  CrowdMind – posts tábla bővítése az új poszt-mezőkkel
--  Másold be a Supabase Dashboard SQL Editorába és futtasd (Run).
--  Idempotens: többször is lefuttatható.
--  Megjegyzés: a kód enélkül is működik (alap mezőkkel);
--  ezekkel lesz poszt-típus, altéma, kép és megtekintés-számláló.
-- ============================================================

alter table public.posts add column if not exists type text default 'question';
alter table public.posts add column if not exists subcategory text;
alter table public.posts add column if not exists media text[];
alter table public.posts add column if not exists views integer not null default 0;
