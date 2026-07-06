import { supabase } from './supabase';

/** fetch, ami automatikusan csatolja a bejelentkezett felhasználó tokenjét. */
export async function authedFetch(input: string, init?: RequestInit): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);
  return fetch(input, { ...init, headers });
}
