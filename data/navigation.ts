import type { LucideIcon } from 'lucide-react';
import {
  Home, Compass, TrendingUp, Clock, Users, Bookmark, Bell,
  Trophy, Circle, Cpu, Car, Wallet, HeartPulse, Plane, Clapperboard, MoreHorizontal,
  Brain, GitCompareArrows, Gauge, Map,
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const mainNav: NavItem[] = [
  { label: 'Kezdőlap', icon: Home },
  { label: 'Felfedezés', icon: Compass },
  { label: 'Trendek', icon: TrendingUp },
  { label: 'Friss', icon: Clock },
  { label: 'Követett', icon: Users },
  { label: 'Mentett', icon: Bookmark },
  { label: 'Értesítések', icon: Bell, badge: 12 },
];

export const topicNav: NavItem[] = [
  { label: 'Sport', icon: Trophy },
  { label: 'Futball', icon: Circle },
  { label: 'Technológia', icon: Cpu },
  { label: 'Autók', icon: Car },
  { label: 'Pénzügy', icon: Wallet },
  { label: 'Egészség', icon: HeartPulse },
  { label: 'Utazás', icon: Plane },
  { label: 'Film & Sorozat', icon: Clapperboard },
  { label: 'Továbbiak', icon: MoreHorizontal },
];

export const toolNav: NavItem[] = [
  { label: 'AI elemző', icon: Brain },
  { label: 'Összehasonlító', icon: GitCompareArrows },
  { label: 'Hangulatindex', icon: Gauge },
  { label: 'Közösségi térkép', icon: Map },
];
