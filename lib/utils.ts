import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class-ok biztonságos összefűzése (feltételes + ütközés-feloldás). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Nagy számok rövidítése: 3200 -> "3.2K", 1_200_000 -> "1.2M". */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}
