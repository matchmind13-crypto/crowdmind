-- Seed-tartalom: 47 indító kérdés a hivatalos 'crowdmind' fiók alá.
-- A dátumok az elmúlt ~13 napra vannak széthúzva (napi 3-4 kérdés üteme),
-- minden számláló nulláról indul (őszinte start), 4 kérdés határidős jóslat.
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
  ('A 48 csapatos vb jót tett a futballnak', 'Több meccs, több ország, több meglepetés — vagy csak felhígult a színvonal? Mondd el, hogy látod!', 'Futball', 'debate', 306, null::timestamptz),
  ('Az e-sport ugyanolyan sport, mint a hagyományosak', 'Reflex, taktika, csapatmunka, edzésterv — csak épp egér van a kézben. Sport ez, vagy sem?', 'Sport', 'debate', 299, null),
  ('Európai válogatott nyeri a 2026-os világbajnokságot', 'A vb hajrájában vagyunk. Tartja Európa a hegemóniát, vagy jön a nagy fordulat? A szavazást a július 18-i döntő előtt lezárjuk — utána kiderül, kinek lett igaza.', 'Futball', 'prediction', 293, '2026-07-18 18:00:00+02'),
  ('Konditerem nélkül is lehet igazán fitt valaki', 'Saját testsúlyos edzés, futás, túrázás vs. bérlet és súlyzók. Kell a terem, vagy csak kifogás?', 'Fitnesz & edzés', 'question', 286, null),
  ('A mai Forma–1 túl kiszámítható lett', 'Aki az élről indul, az nyer? Vagy még mindig a legizgalmasabb sport a világon?', 'Motorsport & F1', 'question', 280, null),
  ('A magánegészségügy ma már alapszükséglet Magyarországon', 'Várólista vs. fizetős gyorsaság. Kimondjuk, ami a levegőben van?', 'Egészség', 'debate', 273, null),
  ('A napi 10 000 lépés túl van misztifikálva', 'Egy marketingkampányból lett világszabály. Tényleg ennyi kell, vagy mindegy, csak mozogj?', 'Fitnesz & edzés', 'question', 267, null),
  ('A rántott húshoz krumplisaláta jár, nem rizs', 'A magyar konyha legnagyobb törésvonala. Válaszd az oldalad — és érvelj!', 'Gasztró & főzés', 'debate', 260, null),
  ('A terápia ma már ugyanolyan természetes kellene legyen, mint a fogorvos', 'A lelki egészség karbantartása még mindig tabu — vagy már nem az? Te elmennél?', 'Pszichológia & önismeret', 'question', 254, null),
  ('A 4 napos munkahét többet tenne az egészségünkért, mint bármelyik diéta', 'Kevesebb stressz, több alvás, több mozgás. Vagy csak szép álom, ami a munkáltatóknak rémálom?', 'Egészség', 'question', 247, null),
  ('A Balaton többet ad, mint a horvát tenger', 'Naplemente, hekk, bringakör vs. sós víz és sziklák. A nyár nagy kérdése — árakkal együtt!', 'Utazás', 'debate', 241, null),
  ('A lángos strandon a legjobb — máshol nem is igazi', 'A vízparti lángos-élmény megfizethetetlen. Vagy a lángos az lángos, mindegy hol eszed?', 'Gasztró & főzés', 'question', 234, null),
  ('A kapszulás kávé nem igazi kávé', 'Kényelmes, gyors, egyforma. A kávésok szerint bűn, a rohanók szerint áldás. Te hova állsz?', 'Kávé', 'question', 228, null),
  ('A magyar fociba több pénz jut, mint amennyit teljesítményben visszaad', 'Stadionok, akadémiák, támogatások — megtérül ez a pályán? Kemény kérdés, őszinte válaszokat várunk.', 'Futball', 'debate', 221, null),
  ('Fapadossal utazni ma már kényelmetlenebb, mint amennyit spórolsz', 'Hajnali indulás, kézipoggyász-dráma, messzi reptér. Megéri még a 15 ezres jegy?', 'Utazás', 'question', 215, null),
  ('A kötelező szervizdíj pofátlanság', '10–15% automatikusan a számlán, kérdés nélkül. Rendben van ez, vagy a borravaló legyen az, ami: önkéntes?', 'Gasztró & főzés', 'debate', 208, null),
  ('A magyar sörök felveszik a versenyt a csehekkel', 'A kisüzemi forradalom után már nem egyértelmű a sorrend. Vagy mégis?', 'Bor & sör', 'question', 202, null),
  ('Egy hét kemping többet ér, mint egy hét all-inclusive', 'Sátor és csillagok vs. svédasztal és medence. Melyik a valódi kikapcsolódás?', 'Természet & túrázás', 'question', 195, null),
  ('Budapest szebb város, mint Bécs', 'Lokálpatriotizmus vagy objektív igazság? A Duna mindkettőn átfolyik — de melyik parton jobb sétálni?', 'Utazás', 'debate', 189, null),
  ('A magyar rap most erősebb, mint a magyar rock valaha volt', 'Streamek, telt házas koncertek, generációs himnuszok. Vagy a rock aranykora verhetetlen marad?', 'Zene', 'debate', 182, null),
  ('A kutya városi lakásban is lehet boldog', 'Elég a napi három séta, vagy kertes ház nélkül bele se kezdjünk? A kutyások két tábora, egy kérdés.', 'Állatok', 'question', 176, null),
  ('A streaming megölte a mozi varázsát', 'Kanapé + sorozat vs. nagyvászon + popcorn. Hova tart a filmnézés?', 'Film & Sorozat', 'question', 169, null),
  ('A Sziget már nem a zenéről szól', 'Fesztivál vagy élménypark? Aki járt (idén vagy régen), mondja el!', 'Zene', 'question', 163, null),
  ('A mobiljátékok is igazi játékok', 'Százmilliók játszanak velük, mégis lenézik őket. A gamer-világ nagy vitája.', 'Gaming', 'question', 156, null),
  ('A magyar filmek jobbak, mint a hírük', 'Díjak, fesztiválsikerek — mégis sokan legyintenek. Igazságos ez?', 'Film & Sorozat', 'question', 150, null),
  ('Egy társasjáték-este többet ér, mint egy kocsmázás', 'Catan a söröző helyett? Vagy a kettő nem is versenytárs?', 'Társasjátékok', 'question', 143, null),
  ('Napi 1 óra videójáték egy gyereknek teljesen rendben van', 'Készségfejlesztés vagy függőség-előszoba? Szülők és gamerek, várjuk az érveket!', 'Gaming', 'question', 137, null),
  ('14 éves kor alatt nem kellene okostelefon a gyerekeknek', 'Egyre több ország korlátozza. Védelem vagy túlzás? Ez mindenkit érint.', 'Technológia', 'debate', 130, null),
  ('Az AI 10 éven belül több munkahelyet teremt, mint amennyit elvesz', 'A történelem eddig mindig ezt hozta a nagy technológiáknál. Ezúttal más lesz?', 'AI & jövő', 'debate', 124, null),
  ('Az elektromos roller áldás a városnak, nem átok', 'Gyors, zöld, olcsó — vagy járdán heverő balesetveszély? Városlakók, szavazzatok!', 'Technológia', 'question', 117, null),
  ('5 éven belül megéri elektromos autóra váltani Magyarországon', 'Töltőhálózat, árak, hatótáv — hol tartunk, és hova jutunk 2031-ig?', 'Autók', 'question', 111, null),
  ('AI-val tanulni nem csalás', 'Ha az AI magyarázza el a tananyagot, az tanulás vagy kiskapu? Diákok, tanárok, szülők — ide veletek!', 'AI & jövő', 'question', 104, null),
  ('Albérlet helyett megéri agglomerációból ingázni', 'Olcsóbb négyzetméter vs. napi másfél óra az utakon. Számoljunk együtt!', 'Pénzügy', 'question', 98, null),
  ('Budapesten belül autót tartani felesleges', 'Tömegközlekedés + bringa + roller vs. a saját autó kényelme és a parkolási pokol. Mi jön ki jobban?', 'Autók', 'debate', 91, null),
  ('A közösségi média többet árt a fiataloknak, mint használ', 'Kapcsolattartás és önkifejezés — vagy szorongás-gyár? Az évtized egyik legfontosabb kérdése.', 'Közösségi média', 'debate', 85, null),
  ('A készpénz 10 éven belül eltűnik Magyarországról', 'A kártya és a telefonos fizetés mindent visz — vagy a készpénz örök?', 'Pénzügy', 'question', 78, null),
  ('Ma Magyarországon jobban megéri alkalmazottnak lenni, mint vállalkozni', 'Biztonság vs. szabadság, adók vs. fizetés. Aki próbálta mindkettőt, annak a véleménye aranyat ér.', 'Vállalkozás & startup', 'debate', 72, null),
  ('A tömegközlekedésnek ingyenesnek kellene lennie Budapesten', 'Bécsben évi 365 euró, Luxemburgban ingyen. Nálunk mi lenne a jó irány?', 'Politika & közélet', 'debate', 65, null),
  ('A forint erősebb lesz az euróhoz képest szeptember végén, mint ma', 'Árfolyam-jóslat: hova tart a forint a nyár után? Szeptember 30-án lezárjuk, és kiderül, kinek lett igaza.', 'Pénzügy', 'prediction', 59, '2026-09-30 18:00:00+02'),
  ('Az influenszer ugyanolyan szakma, mint bármelyik másik', 'Tartalomgyártás, tárgyalás, vállalkozás egy személyben — vagy csak kamera előtti szerencse?', 'Közösségi média', 'question', 52, null),
  ('A klímaváltozás ellen az egyéni szokás is számít, nem csak a nagyipar', 'Szelektív, kevesebb hús, kevesebb repülés — csepp a tengerben, vagy ebből áll össze a tenger?', 'Környezet & klíma', 'debate', 46, null),
  ('A 16 évesek kapjanak szavazati jogot', 'Több országban már működik. Érettség kérdése, vagy jog, ami jár?', 'Politika & közélet', 'debate', 39, null),
  ('Társkereső appon ugyanolyan eséllyel találsz párt, mint élőben', 'A párkapcsolatok fele ma már online indul. Vagy az igazi szikra csak személyesen jön?', 'Család & kapcsolatok', 'question', 33, null),
  ('Megdől idén nyáron a magyarországi melegrekord', 'A rekord 41,9 fok. Jóslat szeptember 1-i lezárással — a nyár végén kiderül, kinek lett igaza.', 'Környezet & klíma', 'prediction', 26, '2026-09-01 12:00:00+02'),
  ('A diploma ma már nem garancia semmire', 'Tapasztalat, kapcsolatok, önfejlesztés vs. papír. Mi számít igazán a munkaerőpiacon?', 'Oktatás & karrier', 'debate', 20, null),
  ('A Bitcoin új történelmi csúcsot dönt még idén', 'Az év végéig eldől. Jóslat december 31-i lezárással — tedd le a voksod!', 'Kripto', 'prediction', 13, '2026-12-31 12:00:00+01'),
  ('A home office-ból visszarendelés a bizalmatlanság jele', 'Ha eddig ment otthonról, miért ne menne ezután is? Vagy az iroda tényleg pótolhatatlan?', 'Oktatás & karrier', 'question', 7, null)
) as v(title, description, category, type, hours_ago, resolve_at)
where p.username = 'crowdmind';

-- Ellenőrzés: 47-nek kell lennie.
select count(*) as feltoltott_kerdesek
from public.posts
where user_id = (select user_id from public.profiles where username = 'crowdmind');
