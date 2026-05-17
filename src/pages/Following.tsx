import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import FollowCard from '../components/following/FollowCard';
import { useAppData } from '../context/AppDataContext';
import { CURRENT_USER_USERNAME, getUser, userFollowingMap } from '../data/mockUsers';
import type { User } from '../types/models';
import './Following.css';

export default function Following() {
  const { username } = useParams();
  const profileUsername = username || CURRENT_USER_USERNAME;
  const { following } = useAppData();
  const profileUser = getUser(profileUsername);
  const isOwn = profileUsername === CURRENT_USER_USERNAME;

  const followedUsers = useMemo(() => {
    const usernames = isOwn ? following : userFollowingMap[profileUsername] || [];
    return usernames.map((u) => getUser(u)).filter((u): u is User => Boolean(u));
  }, [following, isOwn, profileUsername]);

  const backTo = isOwn ? '/profile' : `/profile/${profileUsername}`;

  return (
    <AppLayout narrow>
      <div className="following-page">
        <PageHeader
          title={isOwn ? 'Following' : `${profileUser?.username || profileUsername}`}
          backTo={backTo}
        />
        <p className="following-page__subtitle">Following</p>

        <div className="following-page__list">
          {followedUsers.length > 0 ? (
            followedUsers.map((user) => (
              <FollowCard key={user.username} user={user} isOwnList={isOwn} />
            ))
          ) : (
            <p className="following-page__empty">Not following anyone yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
