-- 1. napi tartalom-frissítés a növekedési terv szerint: 3 friss "Futball" kérdés
-- a hivatalos 'crowdmind' fiók alá. Örökzöld, vitára késztető témák — nem
-- konkrét, ellenőrizhetetlen mai hírre építve.
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

insert into public.posts (user_id, title, description, category, type, yes_votes, no_votes, created_at, resolve_at)
select
  p.user_id, v.title, v.description, v.category, v.type,
  0, 0,
  now() - make_interval(hours => v.hours_ago),
  v.resolve_at
from public.profiles p,
(values
  ('A videóbíró (VAR) többet árt a futballnak, mint amennyit használ', 'Igazságosabb ítéletek, de percekig tartó várakozás és kihűlt gólöröm. Megéri a csere, vagy visszasírjuk a régi, hibázós, de élőbb futballt?', 'Futball', 'debate', 6, null::timestamptz),
  ('Az utánpótlásba fektetett pénz jobban megtérül, mint egy nagy sztárigazolás', 'Egy akadémia évekig épül, egy igazolás egy nyáron eldönthet mindent — vagy csak egy szezonra szól. Melyik a bölcsebb befektetés?', 'Futball', 'debate', 3, null),
  ('A hazai pálya előnye ma már túl van értékelve', 'Zúgó lelátó, ismerős fűszag, hazai szurkolók — vagy ez már csak romantika, és a való életben alig számít? Te mit tapasztaltál?', 'Futball', 'question', 1, null)
) as v(title, description, category, type, hours_ago, resolve_at)
where p.username = 'crowdmind';

-- Ellenőrzés: az utolsó 3 posztnak ennek a 3-nak kell lennie.
select title, category, type, created_at
from public.posts
where user_id = (select user_id from public.profiles where username = 'crowdmind')
order by created_at desc
limit 3;
