import React from 'react';

function MenuIcon({ onClick }) {
  const iconStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    cursor: 'pointer',
    zIndex: 998  // Lower than sidebar's z-index
  };

  const lineStyle = {
    width: '25px',
    height: '3px',
    backgroundColor: '#333',
    margin: '5px 0',
    transition: '0.4s'
  };

  return (
    <div style={iconStyle} onClick={onClick}>
      <div style={lineStyle}></div>
      <div style={lineStyle}></div>
      <div style={lineStyle}></div>
    </div>
  );
}

export default MenuIcon;
