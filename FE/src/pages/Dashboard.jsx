import React from 'react';
import '../styles/colors.css';

export default function Dashboard() {
  const containerStyles = {
    padding: '2rem',
    backgroundColor: 'var(--gray-100)',
    minHeight: 'calc(100vh - 64px)'
  };

  const cardStyles = {
    backgroundColor: 'var(--white)',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  };

  const headerStyles = {
    color: 'var(--primary)',
    marginBottom: '1rem'
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={headerStyles}>Dashboard</h1>
        <p>Selamat datang di dashboard. Ini halaman terproteksi.</p>
      </div>
    </div>
  );
}
