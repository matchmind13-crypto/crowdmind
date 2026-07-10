'use client';
import { useEffect } from 'react';
import { trackFunnel } from '@/lib/funnel';

/** Munkamenetenként egyszer jelzi a látogatást — a tölcsér első lépcsője. */
export function FunnelBeacon() {
  useEffect(() => {
    trackFunnel('latogatas');
  }, []);
  return null;
}
