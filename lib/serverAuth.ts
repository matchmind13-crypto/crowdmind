// Szerver-oldali segéd: a kérés Authorization fejlécében kapott Supabase
// access tokent ellenőrzi, és visszaadja a felhasználó azonosítóját.
// Ez védi az AI-végpontokat: csak bejelentkezett felhasználó hívhatja őket.
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.id === 'string' ? data.id : null;
  } catch {
    return null;
  }
}
