import React from 'react';

function Home() {
  const centerStyle = {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(90deg, #00eaff 0%, #00d6e6 15%, #1ecebfff 35%, #7fdad3ff 70%, #ffffff 100%)'
  };

  const textStyle = {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: '36px'
  };

  return (
    <div style={centerStyle}>
      <div style={textStyle}>SIK-Go</div>
    </div>
  );
}

export default Home;
