import type { LucideIcon } from 'lucide-react';
import {
  Home, Compass, TrendingUp, Clock, Users, Bookmark, Bell,
  Brain, GitCompareArrows, Gauge, Map, CalendarDays,
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

export const toolNav: NavItem[] = [
  { label: 'AI elemző', href: '/analyzer', icon: Brain },
  { label: 'Összehasonlító', href: '/compare', icon: GitCompareArrows },
  { label: 'Hangulatindex', href: '/sentiment', icon: Gauge },
  { label: 'Napi index', href: '/ma', icon: CalendarDays },
  { label: 'Közösségi térkép', href: '/map', icon: Map },
];
