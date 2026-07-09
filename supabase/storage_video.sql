-- Videó-feltöltés engedélyezése a post-media tárolóban:
-- videó-formátumok (MP4, WebM, MOV) + a méretkorlát 50 MB-ra emelése.
-- (A képekre a kliens továbbra is 5 MB-ot enged.)
-- Futtasd le a Supabase SQL Editorban:
-- https://supabase.com/dashboard/project/nlysintxbdetoybbbnnb/sql/new

update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
where id = 'post-media';

-- Ellenőrzés: a sorban 52428800 és a videó-típusok is látszanak.
select id, file_size_limit, allowed_mime_types from storage.buckets where id = 'post-media';
