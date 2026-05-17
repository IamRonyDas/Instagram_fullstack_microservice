import { User } from '../types/models';

export const CURRENT_USER_USERNAME = 'rony_dev';

export const mockUsers: Record<string, User> = {
  rony_dev: {
    username: 'rony_dev',
    fullName: 'Rony Kumar',
    bio: 'Full-stack dev · Building Instagram clone · ☕ & code',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    postsCount: 5,
    followersCount: 1284,
    followingCount: 8,
    isVerified: false,
  },
  jane_doe: {
    username: 'jane_doe',
    fullName: 'Jane Doe',
    bio: 'Photographer · Golden hour chaser 🌅',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    postsCount: 42,
    followersCount: 12500,
    followingCount: 890,
    isVerified: true,
  },
  alex_shots: {
    username: 'alex_shots',
    fullName: 'Alex Rivera',
    bio: 'Adventure & landscape · DM for collabs',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    postsCount: 118,
    followersCount: 48200,
    followingCount: 412,
    isVerified: false,
  },
  'maya.creates': {
    username: 'maya.creates',
    fullName: 'Maya Chen',
    bio: 'Digital artist · Commissions open ✨',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    postsCount: 76,
    followersCount: 22100,
    followingCount: 320,
    isVerified: true,
  },
  'travel.nova': {
    username: 'travel.nova',
    fullName: 'Nova Patel',
    bio: '28 countries · Next stop: Japan 🇯🇵',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    postsCount: 203,
    followersCount: 89000,
    followingCount: 1500,
    isVerified: true,
  },
  'foodie.lena': {
    username: 'foodie.lena',
    fullName: 'Lena Martins',
    bio: 'Home chef · Recipe reels every Friday',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    postsCount: 64,
    followersCount: 15600,
    followingCount: 280,
    isVerified: false,
  },
  'fit.with.sam': {
    username: 'fit.with.sam',
    fullName: 'Sam Wilson',
    bio: 'Personal trainer · Transformations 💪',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    postsCount: 95,
    followersCount: 34100,
    followingCount: 190,
    isVerified: false,
  },
  'art.by.kai': {
    username: 'art.by.kai',
    fullName: 'Kai Nakamura',
    bio: 'Illustrator · Prints in bio link',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    postsCount: 51,
    followersCount: 9800,
    followingCount: 410,
    isVerified: false,
  },
  ankit_prasad: {
    username: 'ankit_prasad',
    fullName: 'Ankit Prasad',
    bio: 'Startup founder · Building in public',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    postsCount: 34,
    followersCount: 4200,
    followingCount: 512,
    isVerified: false,
  },
  vaishnavi_art: {
    username: 'vaishnavi_art',
    fullName: 'Vaishnavi',
    bio: 'Watercolor & ink · Open for collabs',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    postsCount: 88,
    followersCount: 19300,
    followingCount: 640,
    isVerified: false,
  },
  yuvraj_bhati: {
    username: 'yuvraj_bhati',
    fullName: 'Yuvraj Bhati',
    bio: 'Cricket · Fitness · Travel',
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
    postsCount: 61,
    followersCount: 8700,
    followingCount: 301,
    isVerified: false,
  },
};

export const initialFollowing = [
  'jane_doe',
  'alex_shots',
  'maya.creates',
  'travel.nova',
  'foodie.lena',
  'fit.with.sam',
  'ankit_prasad',
  'vaishnavi_art',
];

export const userFollowingMap: Record<string, string[]> = {
  jane_doe: ['alex_shots', 'travel.nova', 'maya.creates'],
  alex_shots: ['jane_doe', 'fit.with.sam'],
  'maya.creates': ['art.by.kai', 'jane_doe'],
  'travel.nova': ['foodie.lena', 'jane_doe', 'alex_shots'],
  'foodie.lena': ['travel.nova', 'maya.creates'],
  'fit.with.sam': ['alex_shots'],
  'art.by.kai': ['maya.creates'],
  rony_dev: initialFollowing,
};

export const searchSuggestions = [
  'jane_doe',
  'travel.nova',
  'maya.creates',
  'foodie.lena',
  'ankit_prasad',
  'vaishnavi_art',
];

export const feedSuggestions = [
  { username: 'ankit_prasad', reason: 'Followed by jane_doe + 3 more' },
  { username: 'vaishnavi_art', reason: 'Followed by maya.creates + 2 more' },
  { username: 'yuvraj_bhati', reason: 'Suggested for you' },
  { username: 'art.by.kai', reason: 'Followed by fit.with.sam' },
  { username: 'foodie.lena', reason: 'Popular in your area' },
];

export function getUser(username: string): User | null {
  return mockUsers[username] || null;
}

export function getAllUsers(): User[] {
  return Object.values(mockUsers);
}

export function searchUsers(query: string): User[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllUsers().filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
  );
}

export function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
