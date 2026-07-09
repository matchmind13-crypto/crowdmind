import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Felhasználó megjelenítése: semleges anonim ikon + felhasználónév.
 * Szándékosan NINCS r/ vagy u/ jelölés – csak a név, pl. "Csanad23".
 * `linkTo` megadásával a publikus profilra visz (kattintható név).
 */
export function UserBadge({
  username,
  size = 'md',
  className,
  linkTo,
  avatarUrl,
}: {
  username: string;
  size?: 'sm' | 'md';
  className?: string;
  linkTo?: string;
  /** Profilkép URL — ha nincs, az anonim alap-ikon jelenik meg. */
  avatarUrl?: string | null;
}) {
  const avatarSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 14 : 16;

  const content = (
    <>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className={cn('rounded-full object-cover ring-1 ring-line', avatarSize)}
        />
      ) : (
        <span
          className={cn(
            'grid place-items-center rounded-full bg-hover text-muted ring-1 ring-line',
            avatarSize,
          )}
        >
          <UserIcon size={iconSize} />
        </span>
      )}
      <span className="text-sm font-medium text-fg-soft">{username}</span>
    </>
  );

  if (linkTo) {
    return (
      <Link
        href={linkTo}
        className={cn(
          'inline-flex items-center gap-2 transition-opacity hover:opacity-75',
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return <span className={cn('inline-flex items-center gap-2', className)}>{content}</span>;
}
