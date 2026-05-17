import { useState } from 'react';
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
  const { visibleItems, sentinelRef, hasMore } = useLazyLoad(feedPosts, 4);
  const [activePost, setActivePost] = useState<EnrichedPost | null>(null);

  const activePostData = activePost
    ? feedPosts.find((p) => p.id === activePost.id) || activePost
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
