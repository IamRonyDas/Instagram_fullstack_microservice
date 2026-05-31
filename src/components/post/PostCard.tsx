import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { formatCount } from '../../data/mockUsers';
import type { EnrichedPost } from '../../types/models';
import ConfirmDialog from '../common/ConfirmDialog';
import './PostCard.css';

interface PostCardProps {
  post: EnrichedPost;
  onCommentClick?: (post: EnrichedPost) => void;
}

export default function PostCard({ post, onCommentClick }: PostCardProps) {
  const { deletePost, currentUsername, getUser } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const isOwn = post.author.username === currentUsername;
  const user = post.author;
  const authorProfile = getUser(post.authorUsername);
  const verified = authorProfile?.isVerified ?? false;

  const handleDelete = () => {
    deletePost(post.id);
    setShowDeleteConfirm(false);
    setMenuOpen(false);
  };

  const handleToggleLike = async () => {
    const currentUser = localStorage.getItem('username');
    if (!currentUser) return;
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      await fetch(`http://localhost:8080/api/posts/${post.id}/like/${currentUser}`, { method });
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (e) {
      console.error('Failed to toggle like', e);
    }
  };

  return (
    <article className="post-card">
      <header className="post-card__header">
        <Link to={`/profile/${user.username}`} className="post-card__author">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="post-card__author-avatar"
            loading="lazy"
          />
          <div className="post-card__author-meta">
            <span className="post-card__username">
              {user.username}
              {verified && (
                <svg className="post-card__verified" viewBox="0 0 40 40" width="12" height="12" aria-label="Verified">
                  <path fill="#0095f6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l3.232-5.15h6.404v-6.354L40 25.36 36.905 20 40 14.641l-5.43-3.137V5.15h-6.404L25.358 0l-5.36 3.094Z" />
                  <path fill="#fff" d="m17.994 24.573 8.69-11.563a1.25 1.25 0 0 1 2 1.5l-9.75 13a1.25 1.25 0 0 1-1.94.033l-4.69-6.375a1.25 1.25 0 1 1 2-1.5l3.684 5.005Z" />
                </svg>
              )}
            </span>
            {post.createdAt && <span className="post-card__time"> · {post.createdAt}</span>}
          </div>
        </Link>
        {isOwn && (
          <div className="post-card__menu-wrap">
            <button
              type="button"
              className="post-card__menu-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
            >
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <>
                <div className="post-card__menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="post-card__menu">
                  <button
                    type="button"
                    className="post-card__menu-item post-card__menu-item--danger"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <div className="post-card__media">
        <img src={post.imageUrl} alt={post.caption || 'Post'} loading="lazy" />
      </div>

      <div className="post-card__actions">
        <div className="post-card__actions-left">
          <button
            type="button"
            className={`post-card__icon-btn${isLiked ? ' post-card__icon-btn--liked' : ''}`}
            onClick={handleToggleLike}
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            className="post-card__icon-btn"
            onClick={() => onCommentClick?.(post)}
            aria-label="Comment"
          >
            <MessageCircle size={24} />
          </button>
          <button type="button" className="post-card__icon-btn" aria-label="Share">
            <Send size={24} />
          </button>
        </div>
        <button
          type="button"
          className={`post-card__icon-btn${saved ? ' post-card__icon-btn--saved' : ''}`}
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Bookmark size={24} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="post-card__likes">{formatCount(likesCount)} likes</p>

      {post.caption && (
        <p className="post-card__caption">
          <Link to={`/profile/${user.username}`} className="post-card__caption-user">
            {user.username}
          </Link>{' '}
          {post.caption}
        </p>
      )}

      {post.comments.length > 0 && (
        <button
          type="button"
          className="post-card__view-comments"
          onClick={() => onCommentClick?.(post)}
        >
          View all {post.comments.length} comments
        </button>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete post?"
          message="Are you sure you want to delete this post?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </article>
  );
}
