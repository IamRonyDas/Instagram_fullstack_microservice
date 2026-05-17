import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { formatCount } from '../../data/mockUsers';
import type { User } from '../../types/models';
import './FollowCard.css';

interface FollowCardProps {
  user: User;
  isOwnList?: boolean;
}

export default function FollowCard({ user, isOwnList = true }: FollowCardProps) {
  const { toggleFollow } = useAppData();

  return (
    <div className="follow-card">
      <Link to={`/profile/${user.username}`} className="follow-card__profile">
        <img src={user.avatarUrl} alt={user.fullName} className="follow-card__avatar" />
        <div className="follow-card__info">
          <span className="follow-card__username">{user.username}</span>
          <span className="follow-card__name">{user.fullName}</span>
          <span className="follow-card__bio">{user.bio}</span>
          <span className="follow-card__followers">
            {formatCount(user.followersCount)} followers
          </span>
        </div>
      </Link>
      {isOwnList && (
        <button type="button" className="follow-card__unfollow" onClick={() => toggleFollow(user.username)}>
          Unfollow
        </button>
      )}
    </div>
  );
}
