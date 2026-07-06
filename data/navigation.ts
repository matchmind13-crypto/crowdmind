import type { LucideIcon } from 'lucide-react';
import {
  Home, Compass, TrendingUp, Clock, Users, Bookmark, Bell,
  Brain, GitCompareArrows, Gauge, Map,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNav: NavItem[] = [
  { label: 'Kezdőlap', href: '/', icon: Home },
  { label: 'Felfedezés', href: '/discover', icon: Compass },
  { label: 'Trendek', href: '/trending', icon: TrendingUp },
  { label: 'Friss', href: '/fresh', icon: Clock },
  { label: 'Követett', href: '/following', icon: Users },
  { label: 'Mentett', href: '/saved', icon: Bookmark },
  { label: 'Értesítések', href: '/notifications', icon: Bell },
];

export const toolNav: { label: string; icon: LucideIcon }[] = [
  { label: 'AI elemző', icon: Brain },
  { label: 'Összehasonlító', icon: GitCompareArrows },
  { label: 'Hangulatindex', icon: Gauge },
  { label: 'Közösségi térkép', icon: Map },
];
