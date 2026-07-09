'use client';
import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, Camera, Loader2, X } from 'lucide-react';
import { uploadAvatar, removeAvatar } from '@/lib/uploadImage';
import { resetMyAvatarCache } from '@/lib/useMyAvatar';
import { supabase } from '@/lib/supabase';

/**
 * Profilkép-kezelő a saját profilon: alapból anonim ikon (mint a Facebookon),
 * kamera-gombbal tölthető fel saját kép, ami a posztoknál és kommenteknél is látszik.
 */
export function AvatarUploader({ userId }: { userId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .maybeSingle();
      if (active) setUrl(((data as any)?.avatar_url as string | null) ?? null);
    })();
    return () => { active = false; };
  }, [userId]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || busy) return;
    setBusy(true);
    setMsg(null);
    const res = await uploadAvatar(file);
    if (res.ok) {
      setUrl(res.url);
      resetMyAvatarCache();
      setMsg({ text: 'Profilkép beállítva. ✓', ok: true });
    } else {
      setMsg({ text: res.error, ok: false });
    }
    setBusy(false);
  }

  async function handleRemove() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const res = await removeAvatar();
    if (res.ok) {
      setUrl(null);
      resetMyAvatarCache();
      setMsg({ text: 'Profilkép eltávolítva — vissza az anonim ikonra.', ok: true });
    } else {
      setMsg({ text: res.error ?? 'Hiba történt.', ok: false });
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4">
      <div className="relative shrink-0">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Profilképed" className="h-16 w-16 rounded-full object-cover ring-1 ring-line" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-hover text-muted ring-1 ring-line">
            <UserIcon size={28} />
          </span>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-accent-strong text-white ring-2 ring-card transition-colors hover:bg-accent disabled:opacity-60"
          aria-label="Profilkép feltöltése"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Profilkép</p>
        <p className="mt-0.5 text-sm text-fg-soft">
          {url ? 'A képed a posztjaidnál és hozzászólásaidnál is látszik.' : 'Most az anonim alap-ikon látszik — tölts fel saját képet, ha szeretnél.'}
        </p>
        {msg && <p className={`mt-1 text-xs ${msg.ok ? 'text-positive' : 'text-negative'}`}>{msg.text}</p>}
      </div>

      {url && (
        <button
          onClick={() => void handleRemove()}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-card-2 px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-hover hover:text-negative"
        >
          <X size={13} />
          Eltávolítás
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => void handleFile(e)} />
    </div>
  );
}
