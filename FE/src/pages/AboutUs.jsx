import React from 'react';

function AboutUs() {
  const pageStyle = {
    height: '100vh',
    background: 'linear-gradient(90deg, #00eaff 0%, #00d6e6 30%, #00bfae 60%, #7fdad3ff 80%, #ffffff 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const titleStyle = {
    color: '#333',
    fontSize: '36px',
    fontFamily: 'Arial',
    fontWeight: 'bold',
    margin: '30px 0'
  };

  const contentStyle = {
    width: '80%',
    maxWidth: '800px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // made more transparent
    borderRadius: '40px',  // increased from 8px
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    fontFamily: 'Arial'
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>About Us</h1>
      <div style={contentStyle}>
        <p>
          Sik-Go is a student team from the Faculty of Engineering, Universitas Indonesia, dedicated to developing intelligent systems powered by artificial intelligence. Our founding members are third-year Computer Engineering undergraduates with multidisciplinary expertise in software engineering, data science, and project management. Our team is currently developing a website that enables users to book rooms within the Faculty of Engineering, Universitas Indonesia, and integrates an AI-powered document scanning feature to ensure compliance with the required formats. As aspiring professionals, we are committed to creating valuable digital solutions for our peers and warmly welcome your support on this journey.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;
