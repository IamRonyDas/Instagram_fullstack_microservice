import { NavLink } from 'react-router-dom';
import {
  Flame,
  Heart,
  Home,
  Search,
  SquarePlus,
} from 'lucide-react';

import { useAppData } from '../../context/AppDataContext';
import './SidebarNav.css';

export default function SidebarNav() {
  const { unreadBadge, currentUser } = useAppData();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-nav__link${isActive ? ' sidebar-nav__link--active' : ''}`;

  return (
    <nav className="sidebar-nav" aria-label="Main navigation">
      <div className="sidebar-nav__inner">
        <NavLink
          to="/"
          className="sidebar-nav__logo"
          aria-label="Instagram home"
        >
          <div className="sidebar-nav__logo-wrap">
            {/* <Instagram size={24} strokeWidth={2} /> */}

            <span className="sidebar-nav__logo-text">
              Instagram
            </span>
          </div>
        </NavLink>

        <NavLink to="/" end className={navClass}>
          <Home size={24} strokeWidth={1.75} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/search" className={navClass}>
          <Search size={24} strokeWidth={1.75} />
          <span>Search</span>
        </NavLink>

        <NavLink to="/trending" className={navClass}>
          <Flame size={24} strokeWidth={1.75} />
          <span>Trending</span>
        </NavLink>

        <NavLink to="/notifications" className={navClass}>
          <Heart size={24} strokeWidth={1.75} />
          <span>Notifications</span>

          {unreadBadge && (
            <span className="sidebar-nav__badge">
              {unreadBadge}
            </span>
          )}
        </NavLink>

        <NavLink to="/add-post" className={navClass}>
          <SquarePlus size={24} strokeWidth={1.75} />
          <span>Create</span>
        </NavLink>

        <NavLink to="/profile" className={navClass}>
          <img
            src={currentUser?.avatarUrl}
            alt="Your profile"
            className="sidebar-nav__avatar"
          />

          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}