-- EMAIL-VISSZAHÍVÁS: minden új értesítés-sorról webhook megy a crowdmind.dev-nek,
-- ami emailt küld a címzettnek (ha nem iratkozott le). FIGYELEM: ez a repóbeli
-- példány HELYKITÖLTŐS — az IDE_JON_A_TITOK helyére a valódi titok kell
-- (a Vercel NOTIFY_WEBHOOK_SECRET értéke; a kitöltött példányt Claude a
-- Desktopra generálja, az sosem kerül a repóba, mert a repo publikus).
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

begin;

-- Leiratkozás-kapcsoló: alapból mindenki kap emailt, amíg le nem iratkozik.
alter table public.profiles
  add column if not exists email_notifications boolean not null default true;

-- pg_net a kimenő HTTP-híváshoz (Supabase-en elérhető bővítmény).
create extension if not exists pg_net;

create or replace function public.notify_email_webhook()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://crowdmind.dev/api/notify-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cm-notify-secret', 'IDE_JON_A_TITOK'
    ),
    body := jsonb_build_object(
      'notification_id', new.id,
      'user_id', new.user_id,
      'post_id', new.post_id,
      'message', new.message
    )
  );
  return new;
exception when others then
  -- Email-gond sose akassza meg magát az értesítés beszúrását.
  return new;
end;
$$;

drop trigger if exists trg_notify_email on public.notifications;
create trigger trg_notify_email
  after insert on public.notifications
  for each row execute function public.notify_email_webhook();

commit;

-- Ellenőrzés: 1-1 sor (oszlop + trigger).
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles' and column_name = 'email_notifications';
select tgname from pg_trigger where tgname = 'trg_notify_email';
