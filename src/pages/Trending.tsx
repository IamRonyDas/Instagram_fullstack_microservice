import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import PostCard from '../components/post/PostCard';
import CommentsModal from '../components/post/CommentsModal';
import { useAppData } from '../context/AppDataContext';
import { useLazyLoad } from '../hooks/useLazyLoad';
import type { EnrichedPost } from '../types/models';
import './Trending.css';

export default function Trending() {
  const { trendingPosts } = useAppData();
  const { visibleItems, sentinelRef, hasMore } = useLazyLoad(trendingPosts, 4);
  const [activePost, setActivePost] = useState<EnrichedPost | null>(null);

  const activePostData = activePost
    ? trendingPosts.find((p) => p.id === activePost.id) || activePost
    : null;

  return (
    <AppLayout narrow>
      <div className="trending-page">
        <PageHeader title="Explore" backTo="/" />

        <main className="trending-page__feed">
          <div className="trending-page__banner">
            <span className="trending-page__fire">🔥</span>
            <div>
              <h2 className="trending-page__heading">Trending Now</h2>
              <p className="trending-page__sub">Top posts from the last 24 hours</p>
            </div>
          </div>
          {visibleItems.length > 0 ? (
            visibleItems.map((post) => (
              <div key={post.id} className="trending-page__item">
                <div className="trending-page__badge">
                  🔥 {post.likesLast24h || 0} likes in last 24 hours
                </div>
                <PostCard post={post} onCommentClick={setActivePost} />
              </div>
            ))
          ) : (
            <p className="trending-page__empty">No trending posts in the last 24 hours.</p>
          )}
          {hasMore && (
            <div ref={sentinelRef} className="trending-page__sentinel">
              Loading more…
            </div>
          )}
        </main>

        <CommentsModal post={activePostData} onClose={() => setActivePost(null)} />
      </div>
    </AppLayout>
  );
}
