import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import type { EnrichedPost } from '../../types/models';
import './CommentsModal.css';

interface CommentsModalProps {
  post: EnrichedPost | null;
  onClose: () => void;
}

interface BackendComment {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

export default function CommentsModal({ post, onClose }: CommentsModalProps) {
  const { currentUsername, getUser } = useAppData();
  const [text, setText] = useState('');
  const [backendComments, setBackendComments] = useState<BackendComment[]>([]);

  useEffect(() => {
    if (!post) return;
    // Fetch real comments from backend
    fetch(`http://localhost:8080/api/posts/${post.id}/comments`)
      .then(r => r.ok ? r.json() : [])
      .then(setBackendComments)
      .catch(() => {});
  }, [post]);

  if (!post) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const username = localStorage.getItem('username') || currentUsername;
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text }),
      });
      if (res.ok) {
        const newComment: BackendComment = await res.json();
        setBackendComments(prev => [...prev, newComment]);
        setText('');
      }
    } catch (e) {
      console.error('Failed to post comment', e);
    }
  };

  const currentUser = getUser(currentUsername);
  const allComments = backendComments;

  return (
    <div className="comments-modal__backdrop" onClick={onClose} role="presentation">
      <div
        className="comments-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-modal-title"
      >
        <header className="comments-modal__header">
          <h2 id="comments-modal-title">Comments</h2>
          <button type="button" className="comments-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="comments-modal__post-preview">
          <img src={post.author.avatarUrl} alt="" className="comments-modal__post-avatar" />
          <p>
            <strong>{post.author.username}</strong> {post.caption}
          </p>
        </div>

        <div className="comments-modal__list">
          {allComments.length === 0 ? (
            <p className="comments-modal__empty">No comments yet. Start the conversation.</p>
          ) : (
            allComments.map((comment) => {
              const author = getUser(comment.username);
              return (
                <div key={comment.id} className="comments-modal__comment">
                  <Link to={`/profile/${comment.username}`}>
                    <img
                      src={author?.avatarUrl || `https://picsum.photos/seed/${comment.username}/150/150`}
                      alt={comment.username}
                      className="comments-modal__comment-avatar"
                    />
                  </Link>
                  <div className="comments-modal__comment-body">
                    <p>
                      <Link to={`/profile/${comment.username}`} className="comments-modal__comment-user">
                        {comment.username}
                      </Link>{' '}
                      {comment.text}
                    </p>
                    <span className="comments-modal__comment-time">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form className="comments-modal__form" onSubmit={handleSubmit}>
          <img src={currentUser?.avatarUrl} alt="You" className="comments-modal__form-avatar" />
          <input
            type="text"
            className="comments-modal__input"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="comments-modal__post-btn" disabled={!text.trim()}>
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
