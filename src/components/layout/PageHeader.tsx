import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './PageHeader.css';

interface PageHeaderProps {
  title?: string;
  backTo?: string;
  rightAction?: ReactNode;
}

export default function PageHeader({ title, backTo = '/', rightAction }: PageHeaderProps) {
  return (
    <header className="page-header">
      <Link to={backTo} className="page-header__back" aria-label="Go back">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>
      {title && <h1 className="page-header__title">{title}</h1>}
      <div className="page-header__right">{rightAction}</div>
    </header>
  );
}
