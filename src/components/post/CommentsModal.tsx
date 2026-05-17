import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import type { EnrichedPost } from '../../types/models';
import './CommentsModal.css';

interface CommentsModalProps {
  post: EnrichedPost | null;
  onClose: () => void;
}

export default function CommentsModal({ post, onClose }: CommentsModalProps) {
  const { addComment, currentUsername, getUser } = useAppData();
  const [text, setText] = useState('');

  if (!post) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(post.id, text);
    setText('');
  };

  const currentUser = getUser(currentUsername);

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
          {post.comments.length === 0 ? (
            <p className="comments-modal__empty">No comments yet. Start the conversation.</p>
          ) : (
            post.comments.map((comment) => {
              const author = getUser(comment.username);
              return (
                <div key={comment.id} className="comments-modal__comment">
                  <Link to={`/profile/${comment.username}`}>
                    <img
                      src={author?.avatarUrl || 'https://i.pravatar.cc/150?img=1'}
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
                    <span className="comments-modal__comment-time">{comment.createdAt}</span>
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
