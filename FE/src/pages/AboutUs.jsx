import React from 'react';

const AboutUs = () => {
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
      position: 'relative',
    },
    accentLine: {
      width: '60px',
      height: '4px',
      background: 'linear-gradient(90deg, var(--blue-accent), var(--blue-light))',
      margin: '1rem auto',
      borderRadius: '2px',
    },
    card: {
      background: 'var(--black-light)',
      borderRadius: '16px',
      padding: '2.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      border: '1px solid var(--border-color)',
    },
    section: {
      paddingTop: '1.5rem',
      marginTop: '1.5rem',
      borderTop: '1px solid var(--border-color)',
    },
    text: {
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
      marginTop: '1rem',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 className="title-hero">About Us</h1>
        <div style={styles.accentLine}></div>
      </div>

      <div style={styles.card}>
        <div>
          <h2 className="subtitle">SIK-GO Team</h2>
          <p style={styles.text}>
            SIK-GO is a student team from the Faculty of Engineering, Universitas Indonesia, 
            dedicated to developing intelligent systems powered by artificial intelligence.
          </p>
        </div>

        <div style={styles.section}>
          <h3>Our Mission</h3>
          <p style={styles.text}>
            We're developing a website that enables users to book rooms within the Faculty 
            of Engineering, Universitas Indonesia, and integrates an AI-powered document 
            scanning feature to ensure compliance with the required formats.
          </p>
        </div>

        <div style={styles.section}>
          <h3>Our Team</h3>
          <p style={styles.text}>
            Our founding members are third-year Computer Engineering undergraduates with 
            multidisciplinary expertise in software engineering, data science, and project 
            management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
