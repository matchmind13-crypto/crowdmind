/**
 * Regisztrációs tölcsér — névtelen lépés-jelzés.
 * Semmilyen azonosítót nem küldünk (se user_id, se süti): csak a lépés nevét.
 * A sessionStorage-zászló gondoskodik róla, hogy egy böngésző-munkamenet
 * minden lépést legfeljebb EGYSZER jelezzen — így a számok „hány munkamenet
 * jutott el idáig" jelentésűek.
 */
export type FunnelStep =
  | 'latogatas'
  | 'login_oldal'
  | 'regisztracio_szandek'
  | 'regisztracio_kesz'
  | 'temakorok_kesz'
  | 'szavazat';

export function trackFunnel(step: FunnelStep) {
  try {
    const key = `cm_funnel_${step}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
    // keepalive: átirányítás (pl. regisztráció utáni ugrás) közben is elmegy.
    void fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: step }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // privát mód / sessionStorage tiltva — a mérés nem kritikus
  }
}
