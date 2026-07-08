import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getUserIdFromRequest } from './serverAuth';
import { SUPABASE_URL } from './publicConfig';

/**
 * Admin-végpontok közös őre: a Bearer tokenből azonosítja a hívót, majd a
 * service-kulccsal ellenőrzi, hogy szerepel-e az admins táblában. Csak ezután
 * adja vissza az emelt jogú klienst — így a service-kulcsot kizárólag
 * igazolt admin kérése mozgathatja.
 */
export async function requireAdmin(
  request: Request,
): Promise<
  | { ok: true; userId: string; admin: SupabaseClient }
  | { ok: false; status: number; error: string }
> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return { ok: false, status: 401, error: 'Bejelentkezés szükséges.' };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return { ok: false, status: 503, error: 'Az admin felület még beállítás alatt áll.' };
  }

  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) {
    // Nem admin (vagy a tábla még nincs meg) — kifelé nem áruljuk el, mi van itt.
    return { ok: false, status: 404, error: 'Nem található.' };
  }

  return { ok: true, userId, admin };
}
