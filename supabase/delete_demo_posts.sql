-- A régi, szerző nélküli DEMO-posztok teljes törlése minden függőségükkel
-- (beégetett kamu szavazatszámok megszűnnek; a valódi, fiókhoz kötött
-- tartalmakat — seed-kérdések, teszt-posztok — NEM érinti).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

create temporary table _demo as
  select id from public.posts where user_id is null;

create temporary table _demo_comments as
  select id from public.comments where post_id in (select id from _demo);

-- Függőségek alulról felfelé
delete from public.comment_likes where comment_id in (select id from _demo_comments);
delete from public.reports where target_type = 'comment' and target_id in (select id from _demo_comments);
delete from public.comments where post_id in (select id from _demo);
delete from public.votes where post_id in (select id from _demo);
delete from public.saved_posts where post_id in (select id from _demo);
delete from public.post_follows where post_id in (select id from _demo);
delete from public.notifications where post_id in (select id from _demo);
delete from public.ai_analyses where post_id in (select id from _demo);
delete from public.reports where target_type = 'post' and target_id in (select id from _demo);
delete from public.posts where id in (select id from _demo);

-- Ellenőrzés: maradt_demo = 0 kell legyen
select
  (select count(*) from public.posts where user_id is null) as maradt_demo,
  (select count(*) from public.posts) as osszes_poszt;

drop table _demo;
drop table _demo_comments;
