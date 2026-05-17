import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { EnrichedPost } from '../../types/models';
import ConfirmDialog from '../common/ConfirmDialog';
import CommentsModal from './CommentsModal';
import './PostDetailModal.css';

interface PostDetailModalProps {
  post: EnrichedPost | null;
  onClose: () => void;
  showDelete?: boolean;
  onDeleted?: () => void;
}

export default function PostDetailModal({
  post,
  onClose,
  showDelete = false,
  onDeleted,
}: PostDetailModalProps) {
  const { toggleLike, deletePost, feedPosts, currentUsername } = useAppData();
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!post) return null;

  const livePost = feedPosts.find((p) => p.id === post.id) || post;
  const authorUsername = livePost.author?.username || livePost.authorUsername;
  const isOwn = authorUsername === currentUsername;

  const handleDelete = () => {
    deletePost(livePost.id);
    setShowDeleteConfirm(false);
    onDeleted?.();
    onClose();
  };

  return (
    <>
      <div className="post-detail__backdrop" onClick={onClose} role="presentation">
        <div
          className="post-detail"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <header className="post-detail__header">
            <Link
              to={`/profile/${authorUsername}`}
              className="post-detail__author"
              onClick={onClose}
            >
              <img src={livePost.author?.avatarUrl} alt="" className="post-detail__avatar" />
              <span>{authorUsername}</span>
            </Link>
            <button type="button" className="post-detail__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </header>

          <div className="post-detail__media">
            <img src={livePost.imageUrl} alt={livePost.caption || 'Post'} />
          </div>

          <div className="post-detail__actions">
            <button
              type="button"
              className={`post-detail__action${livePost.isLiked ? ' post-detail__action--liked' : ''}`}
              onClick={() => toggleLike(livePost.id)}
            >
              <Heart size={22} fill={livePost.isLiked ? 'currentColor' : 'none'} />
            </button>
            <button type="button" className="post-detail__action" onClick={() => setShowComments(true)}>
              <MessageCircle size={22} />
            </button>
          </div>

          <p className="post-detail__likes">{livePost.likesCount?.toLocaleString()} likes</p>

          {livePost.caption && (
            <p className="post-detail__caption">
              <strong>{authorUsername}</strong> {livePost.caption}
            </p>
          )}

          {showDelete && isOwn && (
            <button
              type="button"
              className="post-detail__delete"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete post
            </button>
          )}
        </div>
      </div>

      {showComments && <CommentsModal post={livePost} onClose={() => setShowComments(false)} />}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete post?"
          message="Are you sure you want to delete this post?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
