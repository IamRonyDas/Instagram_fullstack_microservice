import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import PostDetailModal from '../components/post/PostDetailModal';
import { useAppData } from '../context/AppDataContext';
import { CURRENT_USER_USERNAME, formatCount } from '../data/mockUsers';
import { getStaticProfileGrid } from '../data/mockPosts';
import type { EnrichedPost } from '../types/models';
import './Profile.css';

export default function Profile() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const { getUser, isFollowing, toggleFollow, getPostsByUser, enrichPost } = useAppData();

  const username = paramUsername || CURRENT_USER_USERNAME;
  const user = getUser(username);
  const isOwn = username === CURRENT_USER_USERNAME;
  const following = isFollowing(username);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState<EnrichedPost | null>(null);
  const [backendPosts, setBackendPosts] = useState<EnrichedPost[]>([]);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });
  const [isFollowingReal, setIsFollowingReal] = useState(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/posts/user/${username}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (response.ok) {
          const data = await response.json();
          const transformed = data.map((post: any) => ({
            ...post,
            comments: [],
            author: {
              username: post.authorUsername,
              fullName: post.authorUsername,
              avatarUrl: 'https://picsum.photos/seed/' + post.authorUsername + '/150/150',
            }
          }));
          setBackendPosts(transformed);
        }
      } catch (err) {
        console.error('Failed to fetch user posts from backend:', err);
      }
    };
    
    const fetchFollowStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const resStats = await fetch(`http://localhost:8080/api/follows/${username}/stats`);
        if (resStats.ok) {
          const stats = await resStats.json();
          setFollowStats(stats);
        }

        if (!isOwn) {
          const currentUser = localStorage.getItem('username');
          if (currentUser) {
            const resFollow = await fetch(`http://localhost:8080/api/follows/check/${currentUser}/${username}`);
            if (resFollow.ok) {
              const { isFollowing } = await resFollow.json();
              setIsFollowingReal(isFollowing);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch follow stats', err);
      }
    };

    fetchUserPosts();
    fetchFollowStats();
  }, [username, isOwn]);

  const profilePosts = useMemo(() => {
    let localPosts = [];
    if (isOwn) {
      localPosts = getPostsByUser(username);
    } else {
      const staticGrid = getStaticProfileGrid(username);
      localPosts = staticGrid.map((item, index) =>
        enrichPost({
          id: item.id,
          authorUsername: username,
          imageUrl: item.imageUrl,
          caption: item.caption || '',
          likesCount: 50 + index * 17,
          likesLast24h: 0,
          isWithin24h: false,
          isLiked: false,
          createdAt: '',
          comments: [],
        })
      );
    }
    return [...backendPosts, ...localPosts];
  }, [isOwn, username, getPostsByUser, enrichPost, backendPosts]);

  if (!user) {
    return (
      <AppLayout narrow>
        <div className="profile-page">
          <PageHeader title="Profile" backTo="/" />
          <p className="profile-page__not-found">User not found.</p>
        </div>
      </AppLayout>
    );
  }

  const handleFollowingTab = () => {
    if (isOwn) navigate('/following');
    else navigate(`/profile/${username}/following`);
  };

  return (
    <AppLayout narrow>
      <div className="profile-page">
        <section className="profile-page__top">
          <button
            type="button"
            className="profile-page__avatar-btn"
            onClick={isOwn ? () => navigate('/profile/edit') : undefined}
            disabled={!isOwn}
            aria-label={isOwn ? 'Change profile photo' : undefined}
          >
            <img src={user.avatarUrl} alt={user.fullName} className="profile-page__avatar" />
          </button>
          <div className="profile-page__stats">
            <div className="profile-page__stat">
              <strong>{formatCount(isOwn ? profilePosts.length : backendPosts.length || user.postsCount)}</strong>
              <span>posts</span>
            </div>
            <div className="profile-page__stat">
              <strong>{formatCount(followStats.followersCount || user.followersCount)}</strong>
              <span>followers</span>
            </div>
            <button
              type="button"
              className="profile-page__stat profile-page__stat--btn"
              onClick={handleFollowingTab}
            >
              <strong>{formatCount(followStats.followingCount || user.followingCount)}</strong>
              <span>following</span>
            </button>
          </div>
        </section>

        <section className="profile-page__meta">
          <h1 className="profile-page__username">
            {user.username}
            {user.isVerified && <span className="profile-page__verified"> ✓</span>}
          </h1>
          <p className="profile-page__name">{user.fullName}</p>
          {user.bio && <p className="profile-page__bio">{user.bio}</p>}
        </section>

        <section className="profile-page__actions">
          {isOwn ? (
            <>
              <button type="button" className="profile-page__btn" onClick={() => navigate('/profile/edit')}>
                Edit profile
              </button>
              <button type="button" className="profile-page__btn">
                Share profile
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`profile-page__btn${isFollowingReal ? '' : ' profile-page__btn--primary'}`}
                onClick={async () => {
                  const currentUser = localStorage.getItem('username');
                  if (!currentUser) return;
                  const token = localStorage.getItem('token');
                  const method = isFollowingReal ? 'DELETE' : 'POST';
                  await fetch(`http://localhost:8080/api/follows/${currentUser}/${username}`, { method });
                  setIsFollowingReal(!isFollowingReal);
                  setFollowStats(prev => ({
                    ...prev,
                    followersCount: isFollowingReal ? prev.followersCount - 1 : prev.followersCount + 1
                  }));
                }}
              >
                {isFollowingReal ? 'Following' : 'Follow'}
              </button>
              <button type="button" className="profile-page__btn">
                Message
              </button>
            </>
          )}
        </section>

        <nav className="profile-page__tabs" aria-label="Profile sections">
          <button
            type="button"
            className={`profile-page__tab${activeTab === 'posts' ? ' profile-page__tab--active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            type="button"
            className={`profile-page__tab${activeTab === 'following' ? ' profile-page__tab--active' : ''}`}
            onClick={handleFollowingTab}
          >
            Following
          </button>
        </nav>

        {activeTab === 'posts' && (
          <div className="profile-page__grid">
            {profilePosts.length > 0 ? (
              profilePosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="profile-page__grid-item"
                  onClick={() => setSelectedPost(post)}
                  aria-label="View post"
                >
                  <img src={post.imageUrl} alt="" loading="lazy" />
                </button>
              ))
            ) : (
              <p className="profile-page__empty-grid">No posts yet.</p>
            )}
          </div>
        )}

        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            showDelete={isOwn}
            onClose={() => setSelectedPost(null)}
            onDeleted={() => setSelectedPost(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
