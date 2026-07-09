import { supabase } from './supabase';

/**
 * Kép feltöltése a témákhoz (post-media Storage-tároló).
 * Mindenki csak a saját mappájába tölthet (userId/fájlnév), a képek
 * publikusan olvashatók. A tároló létrejöttéig kegyes "hamarosan" választ ad.
 */
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadPostImage(
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string; needsLogin?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'A feltöltéshez jelentkezz be.', needsLogin: true };

  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: 'Csak kép tölthető fel (JPG, PNG, WebP vagy GIF).' };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: 'A kép túl nagy — legfeljebb 5 MB lehet.' };
  }

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) {
    if (/bucket|not found/i.test(error.message)) {
      return { ok: false, error: 'A kép-feltöltés hamarosan elérhető — addig kép-URL-t adhatsz meg.' };
    }
    return { ok: false, error: 'A feltöltés nem sikerült — próbáld újra.' };
  }

  const { data } = supabase.storage.from('post-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
