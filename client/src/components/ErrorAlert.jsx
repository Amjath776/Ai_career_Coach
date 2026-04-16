import React from 'react';

/**
 * ErrorAlert — displays an error message box
 */
export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="alert alert-error fade-in" role="alert">
      <span></span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit', padding: 0 }}></button>
      )}
    </div>
  );
}
