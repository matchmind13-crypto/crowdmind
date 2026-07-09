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

/** Profilkép feltöltése + mentése a profilra (max 2 MB, csak kép).
 *  A régi profilképet best-effort töröljük a tárolóból. */
export async function uploadAvatar(
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string; needsLogin?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'A feltöltéshez jelentkezz be.', needsLogin: true };
  if (!(file.type in IMAGE_TYPES)) {
    return { ok: false, error: 'Csak kép lehet a profilkép (JPG, PNG, WebP, GIF).' };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: 'A profilkép legfeljebb 2 MB lehet.' };
  }

  // A régi kép útvonala (törléshez), mielőtt felülírnánk az URL-t.
  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (profErr && /avatar_url|column|schema cache/i.test(profErr.message)) {
    return { ok: false, error: 'A profilkép funkció hamarosan elérhető.' };
  }

  const ext = IMAGE_TYPES[file.type];
  const path = `${session.user.id}/avatar-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('post-media')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (upErr) {
    return { ok: false, error: 'A feltöltés nem sikerült — próbáld újra.' };
  }
  const { data: pub } = supabase.storage.from('post-media').getPublicUrl(path);

  const { error: dbErr } = await (supabase.from('profiles') as any)
    .update({ avatar_url: pub.publicUrl })
    .eq('user_id', session.user.id);
  if (dbErr) {
    return { ok: false, error: 'A profilkép mentése nem sikerült.' };
  }

  // Régi fájl takarítása (nem kritikus)
  const old = (prof as any)?.avatar_url as string | null;
  if (old) {
    const marker = '/post-media/';
    const idx = old.indexOf(marker);
    if (idx > -1) {
      void supabase.storage.from('post-media').remove([old.slice(idx + marker.length)]);
    }
  }
  return { ok: true, url: pub.publicUrl };
}

/** Profilkép eltávolítása (vissza az anonim ikonra). */
export async function removeAvatar(): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'Jelentkezz be.' };
  const { data: prof } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', session.user.id)
    .maybeSingle();
  const { error } = await (supabase.from('profiles') as any)
    .update({ avatar_url: null })
    .eq('user_id', session.user.id);
  if (error) return { ok: false, error: 'Nem sikerült — próbáld újra.' };
  const old = (prof as any)?.avatar_url as string | null;
  if (old) {
    const marker = '/post-media/';
    const idx = old.indexOf(marker);
    if (idx > -1) {
      void supabase.storage.from('post-media').remove([old.slice(idx + marker.length)]);
    }
  }
  return { ok: true };
}
