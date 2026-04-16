import React from 'react';

/**
 * LoadingSpinner component
 * @param {boolean} fullScreen - Show in full viewport center
 */
export default function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface)',
        gap: '1rem',
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Loading…</p>
      </div>
    );
  }
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
    </div>
  );
}
