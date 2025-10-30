import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen, onClose }) {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    display: isOpen ? 'block' : 'none',
    zIndex: 998
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '250px',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 999
  };

  const menuItemStyle = {
    padding: '20px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    fontFamily: 'Arial'
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={sidebarStyle}>
        <div style={{ paddingTop: '30px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={menuItemStyle}>Home</div>
          </Link>
          <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={menuItemStyle}>About Us</div>
          </Link>
          <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={menuItemStyle}>Settings</div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
