import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import type { User } from '../../types/models';
import './SearchUserRow.css';

interface SearchUserRowProps {
  user: User;
  showFollow?: boolean;
}

export default function SearchUserRow({ user, showFollow = true }: SearchUserRowProps) {
  const { isFollowing, toggleFollow, currentUsername } = useAppData();
  const following = isFollowing(user.username);
  const isSelf = user.username === currentUsername;

  return (
    <div className="search-user-row">
      <Link to={`/profile/${user.username}`} className="search-user-row__profile">
        <img src={user.avatarUrl} alt={user.fullName} className="search-user-row__avatar" />
        <div className="search-user-row__info">
          <span className="search-user-row__username">
            {user.username}
            {user.isVerified && <span className="search-user-row__verified"> ✓</span>}
          </span>
          <span className="search-user-row__name">{user.fullName}</span>
        </div>
      </Link>
      {showFollow && !isSelf && (
        <button
          type="button"
          className={`search-user-row__follow${following ? ' search-user-row__follow--active' : ''}`}
          onClick={() => toggleFollow(user.username)}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}
