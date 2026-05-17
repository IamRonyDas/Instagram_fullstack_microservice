import { ReactNode } from 'react';
import SidebarNav from './SidebarNav';
import './AppLayout.css';

interface AppLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  narrow?: boolean;
}

export default function AppLayout({ children, rightSidebar, narrow = false }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <SidebarNav />
      <div className={`app-layout__body${narrow ? ' app-layout__body--narrow' : ''}`}>
        <main className="app-layout__main">{children}</main>
        {rightSidebar && <aside className="app-layout__aside">{rightSidebar}</aside>}
      </div>
    </div>
  );
}
