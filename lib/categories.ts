import { Trophy, Circle, Cpu, Car, Wallet, HeartPulse, Plane, Clapperboard, type LucideIcon } from 'lucide-react';

export interface Category {
  name: string;
  icon: LucideIcon;
}

/** A választható kategóriák kanonikus listája (az "Egyéni hírfolyam" szűrőhöz). */
export const CATEGORIES: Category[] = [
  { name: 'Sport', icon: Trophy },
  { name: 'Futball', icon: Circle },
  { name: 'Technológia', icon: Cpu },
  { name: 'Autók', icon: Car },
  { name: 'Pénzügy', icon: Wallet },
  { name: 'Egészség', icon: HeartPulse },
  { name: 'Utazás', icon: Plane },
  { name: 'Film & Sorozat', icon: Clapperboard },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
