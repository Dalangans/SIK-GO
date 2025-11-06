import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/colors.css';

export default function Profile() {
  const { user } = useContext(AuthContext);

  const containerStyles = {
    padding: '2rem',
    backgroundColor: 'var(--gray-100)',
    minHeight: 'calc(100vh - 64px)'
  };

  const profileCardStyles = {
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const headerStyles = {
    color: 'var(--primary)',
    marginBottom: '2rem',
    borderBottom: `2px solid var(--primary)`,
    paddingBottom: '0.5rem'
  };

  const infoStyles = {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--gray-100)',
    borderRadius: '4px'
  };

  return (
    <div style={containerStyles}>
      <div style={profileCardStyles}>
        <h1 style={headerStyles}>Profile</h1>
        <div style={infoStyles}>
          <strong>Name:</strong> {user?.name}
        </div>
        <div style={infoStyles}>
          <strong>Email:</strong> {user?.email}
        </div>
      </div>
    </div>
  );
}
