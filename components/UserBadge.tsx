import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Felhasználó megjelenítése: semleges anonim ikon + felhasználónév.
 * Szándékosan NINCS r/ vagy u/ jelölés – csak a név, pl. "Csanad23".
 */
export function UserBadge({
  username,
  size = 'md',
  className,
}: {
  username: string;
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
        <UserIcon size={iconSize} />
      </span>
      <span className="text-sm font-medium text-fg-soft">{username}</span>
    </span>
  );
}
