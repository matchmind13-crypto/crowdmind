-- Kép-feltöltés a témákhoz: post-media Storage-tároló.
-- Publikus olvasás; feltölteni bejelentkezve, mindenki csak a SAJÁT mappájába
-- (userId/fájlnév) tud; max 5 MB, csak képformátumok.
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- A képek publikusan olvashatók (a feedben mindenki látja őket).
drop policy if exists "post_media_read" on storage.objects;
create policy "post_media_read" on storage.objects
  for select using (bucket_id = 'post-media');

-- Feltölteni csak bejelentkezve, kizárólag a saját mappádba lehet.
drop policy if exists "post_media_upload_own" on storage.objects;
create policy "post_media_upload_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- A saját képeidet törölheted.
drop policy if exists "post_media_delete_own" on storage.objects;
create policy "post_media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);
