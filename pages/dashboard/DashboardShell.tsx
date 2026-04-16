import React from 'react';
import { Link, Outlet, NavLink } from 'react-router-dom';
import { DASHBOARD_NAV, APP_NAME } from '../../constants';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

export const DashboardShell: React.FC = () => {
  const user = authService.getCurrentUser();
  const allowed = DASHBOARD_NAV.filter(item => !user || item.roles.includes(user.role));

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-brand">{APP_NAME}</Link>
        <div className="dashboard-meta">
          <div>{user?.name || 'Guest'}</div>
          <small>{user?.role || 'No access'}</small>
        </div>
        <nav className="dashboard-nav">
          {allowed.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={({ isActive }) => isActive ? 'dashboard-link active' : 'dashboard-link'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost-button" onClick={() => authService.logout()}>Logout</button>
      </aside>
      <section className="dashboard-content">
        <Outlet />
      </section>
    </div>
  );
};