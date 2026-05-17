import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { notificationSections } from '../data/mockNotifications';
import { useAppData } from '../context/AppDataContext';
import { useLazyLoad } from '../hooks/useLazyLoad';
import type { Notification } from '../types/models';
import './Notifications.css';

function NotificationItem({ notification }: { notification: Notification }) {
  const { getUser, toggleFollow, isFollowing } = useAppData();
  const user = getUser(notification.username);
  const following = isFollowing(notification.username);
  const isYouAction = notification.message.startsWith('You ');

  return (
    <div className={`notification-item${notification.isNew ? ' notification-item--new' : ''}`}>
      <Link to={`/profile/${notification.username}`} className="notification-item__avatar-link">
        <img
          src={user?.avatarUrl || 'https://i.pravatar.cc/150?img=1'}
          alt={notification.username}
          className="notification-item__avatar"
          loading="lazy"
        />
      </Link>
      <div className="notification-item__content">
        <p className="notification-item__text">
          {!isYouAction && (
            <Link to={`/profile/${notification.username}`} className="notification-item__user">
              {notification.username}
            </Link>
          )}
          {!isYouAction && ' '}
          {notification.message}
          <span className="notification-item__time"> {notification.time}</span>
        </p>
        {notification.showFollowBack && (
          <button
            type="button"
            className={`notification-item__follow-btn${following ? ' notification-item__follow-btn--active' : ''}`}
            onClick={() => toggleFollow(notification.username)}
          >
            {following ? 'Following' : 'Follow back'}
          </button>
        )}
      </div>
      {notification.postThumbnail && (
        <Link to="/" className="notification-item__thumb-link">
          <img
            src={notification.postThumbnail}
            alt=""
            className="notification-item__thumb"
            loading="lazy"
          />
        </Link>
      )}
    </div>
  );
}

export default function Notifications() {
  const { notifications, markNotificationsRead } = useAppData();

  const flatNotifications = useMemo(() => {
    const items: { section: string; notification: Notification }[] = [];
    notificationSections.forEach((section) => {
      notifications.filter(section.filter).forEach((notification) => {
        items.push({ section: section.label, notification });
      });
    });
    return items;
  }, [notifications]);

  const { visibleItems, sentinelRef, hasMore } = useLazyLoad(flatNotifications, 6);

  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  let lastSection = '';

  return (
    <AppLayout narrow>
      <div className="notifications-page">
        <PageHeader title="Notifications" backTo="/" />

        <div className="notifications-page__list">
          {visibleItems.map(({ section, notification }) => {
            const showLabel = section !== lastSection;
            lastSection = section;
            return (
              <section key={`${notification.id}-${section}`}>
                {showLabel && (
                  <h2 className="notifications-page__section-label">{section}</h2>
                )}
                <NotificationItem notification={notification} />
              </section>
            );
          })}

          {hasMore && (
            <div ref={sentinelRef} className="notifications-page__sentinel">
              <span>Loading more notifications…</span>
            </div>
          )}

          {notifications.length === 0 && (
            <p className="notifications-page__empty">No notifications yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
