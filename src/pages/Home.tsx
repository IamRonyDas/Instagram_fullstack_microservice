import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import SuggestionsSidebar from '../components/layout/SuggestionsSidebar';
import PostCard from '../components/post/PostCard';
import CommentsModal from '../components/post/CommentsModal';
import { useAppData } from '../context/AppDataContext';
import { useLazyLoad } from '../hooks/useLazyLoad';
import type { EnrichedPost } from '../types/models';
import './Home.css';

export default function Home() {
  const { feedPosts } = useAppData();
  const [backendPosts, setBackendPosts] = useState<EnrichedPost[]>([]);
  const [activePost, setActivePost] = useState<EnrichedPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) return;

        // Fetch following list
        const followsRes = await fetch(`http://localhost:8080/api/follows/${username}/following`);
        let followingUsers: string[] = [];
        if (followsRes.ok) {
          followingUsers = await followsRes.json();
        }
        
        // Add self to see own posts in feed (optional, but standard for Insta)
        followingUsers.push(username);

        const response = await fetch(`http://localhost:8080/api/posts/feed?usernames=${followingUsers.join(',')}&requestingUsername=${username}`);
        if (response.ok) {
          const data = await response.json();
          // Transform backend posts to match EnrichedPost frontend model
          const transformed = data.map((post: any) => ({
            ...post,
            comments: [], // Comments microservice not implemented yet
            author: {
              username: post.authorUsername,
              fullName: post.authorUsername,
              avatarUrl: 'https://picsum.photos/seed/' + post.authorUsername + '/150/150',
            }
          }));
          setBackendPosts(transformed);
        }
      } catch (err) {
        console.error('Failed to fetch posts from backend:', err);
      }
    };
    fetchPosts();
  }, []);

  const combinedPosts = [...backendPosts, ...feedPosts];
  const { visibleItems, sentinelRef, hasMore } = useLazyLoad(combinedPosts, 4);

  const activePostData = activePost
    ? combinedPosts.find((p) => p.id === activePost.id) || activePost
    : null;

  return (
    <AppLayout rightSidebar={<SuggestionsSidebar />}>
      <div className="home-page">
        <main className="home-page__feed">
          {visibleItems.map((post) => (
            <PostCard key={post.id} post={post} onCommentClick={setActivePost} />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="home-page__sentinel" aria-hidden="true">
              <span className="home-page__loading">Loading more posts…</span>
            </div>
          )}
        </main>

        <CommentsModal post={activePostData} onClose={() => setActivePost(null)} />
      </div>
    </AppLayout>
  );
}
