import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { initialPosts } from '../data/mockPosts';
import { mockNotifications as seedNotifications } from '../data/mockNotifications';
import {
  CURRENT_USER_USERNAME,
  initialFollowing,
  mockUsers as initialMockUsers,
} from '../data/mockUsers';
import type { EnrichedPost, Notification, Post, User } from '../types/models';

interface CreateNotificationParams {
  type: Notification['type'];
  username: string;
  message: string;
  postThumbnail?: string;
  postId?: string;
  isNew?: boolean;
}

interface NotifyInteractionParams {
  type: 'like' | 'comment';
  actorUsername: string;
  targetUsername: string;
  post?: Post;
  commentText?: string;
}

interface AppDataContextValue {
  posts: Post[];
  feedPosts: EnrichedPost[];
  trendingPosts: EnrichedPost[];
  following: string[];
  followingSet: Set<string>;
  currentUser: User;
  currentUsername: string;
  users: Record<string, User>;
  getUser: (username: string) => User | null;
  notifications: Notification[];
  unreadCount: number;
  unreadBadge: string | null;
  markNotificationsRead: () => void;
  addComment: (postId: string, text: string) => void;
  toggleLike: (postId: string) => void;
  toggleFollow: (username: string) => void;
  isFollowing: (username: string) => boolean;
  addPost: (imageUrl: string, caption: string, location?: string) => Post;
  deletePost: (postId: string) => void;
  updateProfile: (updates: { bio?: string; avatarUrl?: string }) => void;
  getPostsByUser: (username: string) => EnrichedPost[];
  enrichPost: (post: Post) => EnrichedPost;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function createNotification({
  type,
  username,
  message,
  postThumbnail,
  postId,
  isNew = true,
}: CreateNotificationParams): Notification {
  return {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    username,
    message,
    time: 'now',
    postThumbnail,
    postId,
    isNew,
    showFollowBack: type === 'follow',
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [users, setUsers] = useState<Record<string, User>>(initialMockUsers);
  const [following, setFollowing] = useState<Set<string>>(() => new Set(initialFollowing));
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [unreadCount, setUnreadCount] = useState(
    () => seedNotifications.filter((n) => n.isNew).length
  );

  const pushNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((c) => c + 1);
  }, []);

  const notifyInteraction = useCallback(
    ({ type, actorUsername, targetUsername, post, commentText }: NotifyInteractionParams) => {
      const thumb = post?.imageUrl;
      const postId = post?.id;

      if (type === 'like') {
        if (targetUsername === CURRENT_USER_USERNAME && actorUsername !== CURRENT_USER_USERNAME) {
          pushNotification(
            createNotification({
              type: 'like',
              username: actorUsername,
              message: 'liked your photo.',
              postThumbnail: thumb,
              postId,
            })
          );
        } else if (actorUsername === CURRENT_USER_USERNAME && targetUsername !== CURRENT_USER_USERNAME) {
          pushNotification(
            createNotification({
              type: 'like',
              username: targetUsername,
              message: `You liked @${targetUsername}'s photo.`,
              postThumbnail: thumb,
              postId,
            })
          );
        }
      }

      if (type === 'comment' && commentText) {
        const msg =
          actorUsername === CURRENT_USER_USERNAME
            ? `You commented: ${commentText}`
            : `commented: ${commentText}`;

        if (targetUsername === CURRENT_USER_USERNAME && actorUsername !== CURRENT_USER_USERNAME) {
          pushNotification(
            createNotification({
              type: 'comment',
              username: actorUsername,
              message: msg.replace('You commented: ', 'commented: '),
              postThumbnail: thumb,
              postId,
            })
          );
        } else if (actorUsername === CURRENT_USER_USERNAME && targetUsername !== CURRENT_USER_USERNAME) {
          pushNotification(
            createNotification({
              type: 'comment',
              username: targetUsername,
              message: `You commented on @${targetUsername}'s photo.`,
              postThumbnail: thumb,
              postId,
            })
          );
        }
      }
    },
    [pushNotification]
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
    setUnreadCount(0);
  }, []);

  const getUser = useCallback((username: string) => users[username] || null, [users]);

  const enrichPost = useCallback(
    (post: Post): EnrichedPost => {
      const author = users[post.authorUsername];
      return {
        ...post,
        author: author
          ? {
              username: author.username,
              fullName: author.fullName,
              avatarUrl: author.avatarUrl,
            }
          : {
              username: post.authorUsername,
              fullName: post.authorUsername,
              avatarUrl: 'https://i.pravatar.cc/150?img=68',
            },
      };
    },
    [users]
  );

  const addComment = useCallback(
    (postId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost) return;

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `c-${Date.now()}`,
                username: CURRENT_USER_USERNAME,
                text: trimmed,
                createdAt: 'now',
              },
            ],
          };
        })
      );

      notifyInteraction({
        type: 'comment',
        actorUsername: CURRENT_USER_USERNAME,
        targetUsername: targetPost.authorUsername,
        post: targetPost,
        commentText: trimmed,
      });
    },
    [notifyInteraction, posts]
  );

  const toggleLike = useCallback(
    (postId: string) => {
      const likedPost = posts.find((p) => p.id === postId);
      if (!likedPost) return;

      const nowLiked = !likedPost.isLiked;

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const isLiked = !post.isLiked;
          const likesDelta = isLiked ? 1 : -1;
          return {
            ...post,
            isLiked,
            likesCount: post.likesCount + likesDelta,
            likesLast24h: post.isWithin24h
              ? Math.max(0, (post.likesLast24h || 0) + likesDelta)
              : post.likesLast24h,
          };
        })
      );

      if (nowLiked) {
        notifyInteraction({
          type: 'like',
          actorUsername: CURRENT_USER_USERNAME,
          targetUsername: likedPost.authorUsername,
          post: likedPost,
        });
      }
    },
    [notifyInteraction, posts]
  );

  const deletePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setUsers((prev) => {
      const user = prev[CURRENT_USER_USERNAME];
      if (!user) return prev;
      return {
        ...prev,
        [CURRENT_USER_USERNAME]: {
          ...user,
          postsCount: Math.max(0, user.postsCount - 1),
        },
      };
    });
  }, []);

  const toggleFollow = useCallback((username: string) => {
    if (username === CURRENT_USER_USERNAME) return;
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  }, []);

  const isFollowing = useCallback((username: string) => following.has(username), [following]);

  const addPost = useCallback((imageUrl: string, caption: string, location?: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorUsername: CURRENT_USER_USERNAME,
      imageUrl,
      caption: caption.trim(),
      location: location?.trim() || undefined,
      likesCount: 0,
      likesLast24h: 0,
      isWithin24h: true,
      isLiked: false,
      createdAt: 'now',
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setUsers((prev) => {
      const user = prev[CURRENT_USER_USERNAME];
      return {
        ...prev,
        [CURRENT_USER_USERNAME]: {
          ...user,
          postsCount: (user?.postsCount || 0) + 1,
        },
      };
    });
    return newPost;
  }, []);

  const updateProfile = useCallback(({ bio, avatarUrl }: { bio?: string; avatarUrl?: string }) => {
    setUsers((prev) => ({
      ...prev,
      [CURRENT_USER_USERNAME]: {
        ...prev[CURRENT_USER_USERNAME],
        ...(bio !== undefined ? { bio } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
    }));
  }, []);

  const feedPosts = useMemo(() => posts.map(enrichPost), [posts, enrichPost]);

  const trendingPosts = useMemo(
    () =>
      [...posts]
        .filter((p) => p.isWithin24h)
        .sort((a, b) => (b.likesLast24h || 0) - (a.likesLast24h || 0))
        .map(enrichPost),
    [posts, enrichPost]
  );

  const currentUser = users[CURRENT_USER_USERNAME];

  const value = useMemo<AppDataContextValue>(
    () => ({
      posts,
      feedPosts,
      trendingPosts,
      following: Array.from(following),
      followingSet: following,
      currentUser,
      currentUsername: CURRENT_USER_USERNAME,
      users,
      getUser,
      notifications,
      unreadCount,
      unreadBadge: unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null,
      markNotificationsRead,
      addComment,
      toggleLike,
      toggleFollow,
      isFollowing,
      addPost,
      deletePost,
      updateProfile,
      getPostsByUser: (username: string) =>
        posts.filter((p) => p.authorUsername === username).map(enrichPost),
      enrichPost,
    }),
    [
      posts,
      feedPosts,
      trendingPosts,
      following,
      currentUser,
      users,
      getUser,
      notifications,
      unreadCount,
      markNotificationsRead,
      addComment,
      toggleLike,
      toggleFollow,
      isFollowing,
      addPost,
      deletePost,
      updateProfile,
      enrichPost,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
