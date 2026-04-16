/**
 * Sidebar Navigation
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '', path: '/dashboard' },
];
const AI_TOOLS = [
  { label: 'Resume Builder', icon: '', path: '/resume' },
  { label: 'Cover Letter', icon: '', path: '/cover-letter' },
  { label: 'Job Recommendations', icon: '', path: '/jobs' },
  { label: 'Career Path', icon: '', path: '/career-path' },
  { label: 'Skill Gap Analysis', icon: '', path: '/skill-gap' },
  { label: 'Learning Roadmap', icon: '', path: '/roadmap' },
  { label: 'Interview Prep', icon: '', path: '/interview' },
  { label: 'Industry Insights', icon: '', path: '/industry' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="sidebar">
      {/* Logo */}      <div className="sidebar-logo">
        <div className="sidebar-logo-text">AI Career <span>Coach</span></div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.icon && <span className="sidebar-link-icon">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">AI Tools</div>
          {AI_TOOLS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.icon && <span className="sidebar-link-icon">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ marginBottom: '0.75rem' }}>
          <div className="user-avatar" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.currentTitle || 'Professional'}</div>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%', color: '#fca5a5' }}>
          
          Sign Out
        </button>
      </div>
    </aside>
  );
}
