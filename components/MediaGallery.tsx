'use client';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

/**
 * Média-galéria a posztokhoz.
 * - 1 kép: nagy, 16:9 arányú.
 * - több kép: 4-es rács; a 4. csempén "+N" overlay a maradék képekre.
 */
export function MediaGallery({ images }: { images: string[] }) {
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-line">
        <Tile src={images[0]} broken={broken[0]} onError={() => setBroken((b) => ({ ...b, 0: true }))} ratio="aspect-video" />
      </div>
    );
  }

  const tiles = images.slice(0, 4);
  const remaining = images.length - 4;

  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {tiles.map((src, i) => (
        <div key={i} className="relative overflow-hidden rounded-xl ring-1 ring-line">
          <Tile
            src={src}
            broken={broken[i]}
            onError={() => setBroken((b) => ({ ...b, [i]: true }))}
            ratio="aspect-[4/3]"
          />
          {i === 3 && remaining > 0 && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 text-lg font-semibold text-white backdrop-blur-[1px]">
              +{remaining}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Tile({
  src,
  broken,
  onError,
  ratio,
}: {
  src: string;
  broken?: boolean;
  onError: () => void;
  ratio: string;
}) {
  if (broken) {
    return (
      <div className={`grid ${ratio} w-full place-items-center bg-gradient-to-br from-accent-strong/20 to-card-2 text-muted`}>
        <ImageIcon size={24} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={onError}
      className={`${ratio} w-full object-cover transition-transform duration-300 hover:scale-[1.03]`}
    />
  );
}
