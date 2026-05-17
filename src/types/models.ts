export interface User {
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorUsername: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  likesLast24h: number;
  isWithin24h: boolean;
  isLiked: boolean;
  createdAt: string;
  comments: Comment[];
}

export interface EnrichedPost extends Post {
  author: {
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

export interface Notification {
  id: string;
  type: NotificationType;
  username: string;
  message: string;
  time: string;
  postThumbnail?: string;
  postId?: string;
  isNew: boolean;
  showFollowBack?: boolean;
}

export interface Suggestion {
  username: string;
  reason: string;
}
