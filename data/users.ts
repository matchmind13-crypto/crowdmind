import type { User } from './types';

export const currentUser: User = {
  id: 'u_me',
  username: 'Csanad23',
  avatarUrl: null,
  credibility: 87,
  badges: ['trusted'],
  pro: true,
};

export const users: Record<string, User> = {
  u_me: currentUser,
  u_jedi: {
    id: 'u_jedi',
    username: 'JediMindTricks',
    avatarUrl: null,
    credibility: 92,
    badges: ['expert', 'top'],
  },
  u_force: {
    id: 'u_force',
    username: 'ForceGhost22',
    avatarUrl: null,
    credibility: 74,
    badges: ['experience'],
  },
  u_speed: {
    id: 'u_speed',
    username: 'SpeedLover95',
    avatarUrl: null,
    credibility: 68,
    badges: [],
  },
  u_tech: {
    id: 'u_tech',
    username: 'TechFanatic',
    avatarUrl: null,
    credibility: 81,
    badges: ['trusted'],
  },
  u_owner: {
    id: 'u_owner',
    username: 'GT3Owner',
    avatarUrl: null,
    credibility: 95,
    badges: ['owner', 'expert'],
  },
};

export function getUser(id: string): User {
  return users[id] ?? currentUser;
}
