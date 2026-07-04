import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/data/types';

/**
 * Felhasználó megjelenítése: semleges anonim ikon (ha nincs profilkép) + felhasználónév.
 * Szándékosan NINCS r/ vagy u/ jelölés – csak a név, pl. "Csanad23".
 */
export function UserBadge({
  user,
  size = 'md',
  className,
}: {
  user: User;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const avatarSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'grid place-items-center rounded-full bg-hover text-muted ring-1 ring-line',
          avatarSize,
        )}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <UserIcon size={iconSize} />
        )}
      </span>
      <span className="text-sm font-medium text-fg-soft">{user.username}</span>
    </span>
  );
}
