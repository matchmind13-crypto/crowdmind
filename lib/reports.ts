import { supabase } from './supabase';

/**
 * Tartalom-jelentés (reports tábla). Egy felhasználó egy tartalmat egyszer
 * jelenthet (unique kényszer). A jelentéseket az admin a Supabase
 * Table Editorban látja — kliens-oldalon senki másét nem lehet olvasni.
 */

export const REPORT_REASONS = [
  'Spam vagy hirdetés',
  'Sértő vagy gyűlölködő',
  'Félrevezető információ',
  'Egyéb',
] as const;

export async function submitReport(
  targetType: 'post' | 'comment',
  targetId: number,
  reason: string,
): Promise<{ ok: boolean; already?: boolean; needsLogin?: boolean; unavailable?: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, needsLogin: true };

  const { error } = await (supabase.from('reports') as any).insert({
    reporter_id: session.user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
  });
  if (error) {
    if (error.code === '23505') return { ok: false, already: true };
    if (/relation|does not exist|schema cache/i.test(error.message)) {
      return { ok: false, unavailable: true };
    }
    return { ok: false };
  }
  return { ok: true };
}
