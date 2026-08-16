import React from 'react';

export default function NotFound({ onGoHome }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#111111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif",
      color: '#e5e3dd',
      gap: '1.5rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <span style={{ fontSize: '5rem', fontWeight: 700, color: '#c84028', letterSpacing: '-0.04em', lineHeight: 1 }}>404</span>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Page not found</h1>
      <p style={{ color: '#888', fontSize: '1rem', maxWidth: '340px', lineHeight: 1.6, margin: 0 }}>
        This route doesn't exist in the mesh. Packets only travel on known paths.
      </p>
      <button
        onClick={onGoHome}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 2rem',
          background: '#c84028',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.95rem',
          cursor: 'pointer',
          letterSpacing: '0.02em'
        }}
      >
        Back to OFF MESH.
      </button>
    </div>
  );
}
