import { useState, useMemo, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import PostCard from '../components/post/PostCard';
import CommentsModal from '../components/post/CommentsModal';
import { useAppData } from '../context/AppDataContext';
import { useLazyLoad } from '../hooks/useLazyLoad';
import { initialPosts } from '../data/mockPosts';
import type { EnrichedPost } from '../types/models';
import './Trending.css';

type SortType = 'likes' | 'hashtag' | 'location';

export default function Trending() {
  const { trendingPosts, enrichPost } = useAppData();
  const [activePost, setActivePost] = useState<EnrichedPost | null>(null);

  const [sortType, setSortType] = useState<SortType>('likes');
  const [selectedValue, setSelectedValue] = useState<string>('');
  
  const [filteredPosts, setFilteredPosts] = useState<EnrichedPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derive options directly from initialPosts so they appear even if context is stale from hot reload
  const availableHashtags = useMemo(() => {
    const tags = new Set<string>();
    initialPosts.filter(p => p.isWithin24h).forEach(p => {
      p.hashtags?.forEach(t => tags.add(t));
    });
    return Array.from(tags).slice(0, 5);
  }, []);

  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    initialPosts.filter(p => p.isWithin24h).forEach(p => {
      if (p.location) locs.add(p.location);
    });
    return Array.from(locs).slice(0, 5);
  }, []);

  // Separate filtering logic simulating a backend API call
  const fetchFilteredPosts = useCallback(async (type: SortType, value: string) => {
    setIsLoading(true);
    
    try {
      // Simulate network latency for backend request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulating backend database query using initialPosts as source of truth
      let mockDbResults = [...initialPosts].filter(p => p.isWithin24h);
      
      if (type === 'hashtag' && value) {
        mockDbResults = mockDbResults.filter(p => p.hashtags?.includes(value));
      } else if (type === 'location' && value) {
        mockDbResults = mockDbResults.filter(p => p.location === value);
      }
      
      // Sort by likes as requested for trending
      mockDbResults.sort((a, b) => (b.likesLast24h || 0) - (a.likesLast24h || 0));
      
      // Enrich mock DB results to match frontend models (simulating backend populated relations)
      const enrichedResults = mockDbResults.map(p => enrichPost(p));
      
      setFilteredPosts(enrichedResults);
    } finally {
      setIsLoading(false);
    }
  }, [enrichPost]);

  // Trigger backend fetch when sort or selection changes
  useEffect(() => {
    // If a filter type is selected but no value is chosen yet, we can either wait or show empty.
    // Let's show all trending if no value is selected, or wait until selected.
    if (sortType === 'likes' || selectedValue) {
      fetchFilteredPosts(sortType, selectedValue);
    } else {
      setFilteredPosts([]);
      setIsLoading(false);
    }
  }, [sortType, selectedValue, fetchFilteredPosts]);

  // We re-initialize the lazy loader when filteredPosts changes
  const { visibleItems, sentinelRef, hasMore } = useLazyLoad(filteredPosts, 4);

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

          <div className="trending-page__filters">
            <select
              value={sortType}
              onChange={(e) => {
                setSortType(e.target.value as SortType);
                setSelectedValue('');
              }}
              className="trending-page__select"
            >
              <option value="likes">Sort by Likes</option>
              <option value="hashtag">Filter by Hashtag</option>
              <option value="location">Filter by Location</option>
            </select>

            {sortType === 'hashtag' && (
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="trending-page__select"
              >
                <option value="">Select a hashtag...</option>
                {availableHashtags.map(t => (
                  <option key={t} value={t}>#{t}</option>
                ))}
              </select>
            )}

            {sortType === 'location' && (
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="trending-page__select"
              >
                <option value="">Select a location...</option>
                {availableLocations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}
          </div>

          <div className="trending-page__content">
            {isLoading ? (
              <div className="trending-page__loading">
                <div className="trending-page__spinner"></div>
                <p>Refreshing posts...</p>
              </div>
            ) : visibleItems.length > 0 ? (
              visibleItems.map((post) => (
                <div key={post.id} className="trending-page__item">
                  <div className="trending-page__badge">
                    🔥 {post.likesLast24h || 0} likes in last 24 hours
                  </div>
                  <PostCard post={post} onCommentClick={setActivePost} />
                </div>
              ))
            ) : (
              <p className="trending-page__empty">
                {sortType !== 'likes' && !selectedValue 
                  ? `Please select a ${sortType} to view posts.` 
                  : 'No trending posts found.'}
              </p>
            )}
            
            {!isLoading && hasMore && (
              <div ref={sentinelRef} className="trending-page__sentinel">
                Loading more…
              </div>
            )}
          </div>
        </main>

        <CommentsModal post={activePostData} onClose={() => setActivePost(null)} />
      </div>
    </AppLayout>
  );
}
