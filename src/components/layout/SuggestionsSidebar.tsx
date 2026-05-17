import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { feedSuggestions } from '../../data/mockUsers';
import './SuggestionsSidebar.css';

export default function SuggestionsSidebar() {
  const { currentUser, getUser, isFollowing, toggleFollow, currentUsername } = useAppData();

  return (
    <div className="suggestions-sidebar">
      <div className="suggestions-sidebar__user">
        <Link to="/profile">
          <img src={currentUser?.avatarUrl} alt="" className="suggestions-sidebar__avatar" />
        </Link>
        <div className="suggestions-sidebar__user-meta">
          <Link to="/profile" className="suggestions-sidebar__username">
            {currentUser?.username}
          </Link>
          <span className="suggestions-sidebar__fullname">{currentUser?.fullName}</span>
        </div>
        <button type="button" className="suggestions-sidebar__switch">
          Switch
        </button>
      </div>

      <div className="suggestions-sidebar__header">
        <span>Suggested for you</span>
        <button type="button" className="suggestions-sidebar__see-all">
          See All
        </button>
      </div>

      <ul className="suggestions-sidebar__list">
        {feedSuggestions.map(({ username, reason }) => {
          const user = getUser(username);
          if (!user) return null;
          const following = isFollowing(username);
          const isSelf = username === currentUsername;

          return (
            <li key={username} className="suggestions-sidebar__item">
              <Link to={`/profile/${username}`} className="suggestions-sidebar__profile">
                <img src={user.avatarUrl} alt="" className="suggestions-sidebar__avatar" />
                <div>
                  <span className="suggestions-sidebar__username">{user.username}</span>
                  <span className="suggestions-sidebar__reason">{reason}</span>
                </div>
              </Link>
              {!isSelf && (
                <button
                  type="button"
                  className="suggestions-sidebar__follow"
                  onClick={() => toggleFollow(username)}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="suggestions-sidebar__footer">
        <p className="suggestions-sidebar__links">
          About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language · Meta Verified
        </p>
        <p className="suggestions-sidebar__copy">© 2026 INSTAGRAM FROM META</p>
      </footer>
    </div>
  );
}
