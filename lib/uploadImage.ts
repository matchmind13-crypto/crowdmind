import { supabase } from './supabase';

/**
 * Kép- és videó-feltöltés a témákhoz (post-media Storage-tároló).
 * Mindenki csak a saját mappájába tölthet (userId/fájlnév), a fájlok
 * publikusan olvashatók. Kép: max 5 MB, videó: max 50 MB.
 */
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024;

export async function uploadPostMedia(
  file: File,
): Promise<
  | { ok: true; url: string; kind: 'image' | 'video' }
  | { ok: false; error: string; needsLogin?: boolean }
> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'A feltöltéshez jelentkezz be.', needsLogin: true };

  const kind: 'image' | 'video' | null =
    file.type in IMAGE_TYPES ? 'image' : file.type in VIDEO_TYPES ? 'video' : null;
  if (!kind) {
    return { ok: false, error: 'Kép (JPG, PNG, WebP, GIF) vagy videó (MP4, WebM, MOV) tölthető fel.' };
  }
  if (kind === 'image' && file.size > MAX_IMAGE) {
    return { ok: false, error: 'A kép túl nagy — legfeljebb 5 MB lehet.' };
  }
  if (kind === 'video' && file.size > MAX_VIDEO) {
    return { ok: false, error: 'A videó túl nagy — legfeljebb 50 MB lehet.' };
  }

  const ext = kind === 'image' ? IMAGE_TYPES[file.type] : VIDEO_TYPES[file.type];
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) {
    if (/bucket|not found/i.test(error.message)) {
      return { ok: false, error: 'A feltöltés hamarosan elérhető — addig URL-t adhatsz meg.' };
    }
    if (/mime|not supported|content.?type/i.test(error.message)) {
      return { ok: false, error: 'A videó-feltöltés hamarosan elérhető — a tároló frissítésre vár.' };
    }
    if (/exceeded|size|payload/i.test(error.message)) {
      return { ok: false, error: 'A fájl túl nagy a tárolónak.' };
    }
    return { ok: false, error: 'A feltöltés nem sikerült — próbáld újra.' };
  }

  const { data } = supabase.storage.from('post-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl, kind };
}
