/**
 * Top Navbar for authenticated layout
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="navbar">
      <div className="navbar-title">{title}</div>
      <div className="navbar-right">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user?.industry || 'AI Career Coach'}</div>
        </div>
        <div className="user-avatar">{getInitials(user?.name)}</div>
      </div>
    </header>
  );
}
