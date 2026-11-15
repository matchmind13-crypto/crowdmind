-- ALTATÁS, 1. lépés: a két lejárt jóslat lezárása valós eredmények alapján (2026-11-12).
-- vb (id 33): BEJÖTT — Spanyolország (európai válogatott) nyerte a döntőt júl. 19-én.
-- forint (id 69): NEM JÖTT BE — EKB-referencia 2026-09-30: 366,20 HUF/EUR,
--   szemben a június végi ~353,90-nel → a forint gyengült, nem erősödött.
-- A Bitcoin-jóslat (id 76) dec. 31-ig nyitva marad — azt januárban kell lezárni.
-- Ugyanazt csinálja, mint az admin pult gombja: outcome + értesítés minden szavazónak.
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

-- 1) VB-jóslat (id 33): BEJÖTT
update public.posts set outcome = 'yes' where id = 33 and outcome is null;

insert into public.notifications (user_id, post_id, message, read)
select v.user_id, 33,
  case when v.vote = 'yes'
    then '🎯 Igazad lett! Bejött a tipped itt: „Európai válogatott nyeri a 2026-os világbajnokságot” — a találat a profilodon is megjelenik.'
    else 'A jóslat eldőlt: „Európai válogatott nyeri a 2026-os világbajnokságot” — ezúttal nem jött össze, a következőnél tiéd a pálya!'
  end,
  false
from public.votes v
where v.post_id = 33 and v.vote in ('yes','no');

-- 2) Forint-jóslat (id 69): NEM JÖTT BE
update public.posts set outcome = 'no' where id = 69 and outcome is null;

insert into public.notifications (user_id, post_id, message, read)
select v.user_id, 69,
  case when v.vote = 'no'
    then '🎯 Igazad lett! Bejött a tipped itt: „A forint erősebb lesz az euróhoz képest szeptember végén, mint ma” — a találat a profilodon is megjelenik.'
    else 'A jóslat eldőlt: „A forint erősebb lesz az euróhoz képest szeptember végén, mint ma” — ezúttal nem jött össze, a következőnél tiéd a pálya!'
  end,
  false
from public.votes v
where v.post_id = 69 and v.vote in ('yes','no');

-- Ellenőrzés: a két outcome kitöltve, és csak a Bitcoin (76) maradt nyitva.
select id, title, outcome, resolve_at
from public.posts
where type = 'prediction'
order by resolve_at;
