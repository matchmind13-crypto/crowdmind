'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, LogIn, ImageIcon, Upload, X, Check } from 'lucide-react';
import { createPost } from '@/lib/postsDb';
import { uploadPostImage } from '@/lib/uploadImage';
import { CATEGORIES } from '@/lib/categories';
import { useAuth } from '@/lib/useAuth';
import type { PostType } from '@/data/types';

const TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: 'question', label: 'Kérdés' },
  { value: 'opinion', label: 'Vélemény' },
  { value: 'debate', label: 'Vita' },
  { value: 'experience', label: 'Tapasztalat' },
  { value: 'comparison', label: 'Összehasonlítás' },
];

export default function CreatePostPage() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [subcategory, setSubcategory] = useState('');
  const [type, setType] = useState<PostType>('question');
  const [body, setBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || uploading) return;
    setUploading(true);
    setUploadMsg(null);
    const res = await uploadPostImage(file);
    if (res.ok) {
      setMediaUrl(res.url);
      setUploadMsg({ text: 'Kép feltöltve — a téma alján fog megjelenni. ✓', ok: true });
    } else {
      setUploadMsg({ text: res.error, ok: false });
    }
    setUploading(false);
  }

  async function handleSubmit() {
    if (!title.trim()) { setError('Adj címet a témának!'); return; }
    setSaving(true);
    setError('');
    const res = await createPost({ title, category, subcategory, type, body, mediaUrl });
    if (!res.ok) {
      setError(res.error ?? 'Hiba a mentéskor');
      setSaving(false);
      return;
    }
    window.location.href = '/';
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg-soft">
        <ArrowLeft size={15} />
        Vissza a hírfolyamhoz
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-fg">Új téma indítása</h1>
      <p className="mt-1 text-sm text-muted">Kérdezz, oszd meg a véleményed, vagy indíts vitát – a közösség válaszol.</p>

      {!loading && !user ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-8 text-center">
          <LogIn size={26} className="mx-auto mb-3 text-accent-soft" />
          <p className="text-sm text-fg-soft">Téma létrehozásához be kell jelentkezned.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
          >
            Bejelentkezés
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-6">
          <Field label="Cím *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pl. Megéri most elektromos autót venni?"
              maxLength={160}
              className="w-full rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategória *">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg focus:border-accent/40 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Altéma (opcionális)">
              <input
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Pl. Tesla"
                maxLength={40}
                className="w-full rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </Field>
          </div>

          <Field label="Poszt típusa">
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    type === t.value
                      ? 'border-accent/50 bg-accent-strong/20 text-accent-soft'
                      : 'border-line bg-bg-elevated text-fg-soft hover:bg-hover'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Leírás">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Fejtsd ki bővebben… (üres bekezdéssel tagolhatod)"
              rows={6}
              className="w-full resize-y rounded-xl border border-line bg-bg-elevated px-4 py-3 text-sm leading-relaxed text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </Field>

          <Field label="Kép (opcionális)">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => void handleFile(e)} />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-card-2 px-4 py-3 text-sm font-medium text-fg-soft transition-colors hover:bg-hover disabled:opacity-60"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} className="text-accent-soft" />}
                {uploading ? 'Feltöltés…' : 'Kép feltöltése a gépedről'}
              </button>
              <div className="relative min-w-0 flex-1">
                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="…vagy illessz be kép-URL-t"
                  className="w-full rounded-xl border border-line bg-bg-elevated py-3 pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
            {uploadMsg && (
              <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${uploadMsg.ok ? 'text-positive' : 'text-negative'}`}>
                {uploadMsg.ok && <Check size={13} />}
                {uploadMsg.text}
              </p>
            )}
            {mediaUrl.trim() !== '' && (
              <div className="relative mt-2.5 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl}
                  alt="Kép előnézet"
                  className="max-h-44 rounded-xl border border-line object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => { setMediaUrl(''); setUploadMsg(null); }}
                  className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-line bg-card text-muted transition-colors hover:text-negative"
                  aria-label="Kép eltávolítása"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </Field>

          {error && <p className="text-sm text-negative">{error}</p>}

          <button
            onClick={() => void handleSubmit()}
            disabled={saving || !title.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {saving ? 'Közzététel…' : 'Téma közzététele'}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
