import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/colors.css';

export default function NavBar({ onMenuClick }) {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navStyles = {
    display: 'flex',
    gap: 20,
    padding: '1rem 2rem',
    alignItems: 'center',
    backgroundColor: 'var(--primary)',
    color: 'var(--text-primary)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const linkStyles = {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  };

  const buttonStyles = {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  };

  return (
    <nav style={navStyles}>
      <button onClick={onMenuClick} style={{...buttonStyles, padding: '0.5rem'}}>☰</button>
      <Link to="/" style={linkStyles}>Home</Link>
      <Link to="/about" style={linkStyles}>About</Link>
      {isAuthenticated && <Link to="/dashboard" style={linkStyles}>Dashboard</Link>}
      {isAuthenticated && <Link to="/profile" style={linkStyles}>Profile</Link>}
      <div style={{ marginLeft: 'auto' }}>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: 16 }}>Hi, {user?.name}</span>
            <button onClick={() => logout()} style={buttonStyles}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={buttonStyles}>Login</Link>
        )}
      </div>
    </nav>
  );
}
