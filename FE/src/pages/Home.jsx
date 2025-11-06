import React from 'react';

const Home = () => {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div>
        <h1 className="title-hero">Pengajuan Proposal</h1>
        <p className="subtitle" style={{marginBottom: '2rem'}}>
          Sistem Informasi Kemahasiswaan FTUI
        </p>
        
        <div style={{
          background: 'var(--black-light)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📄</div>
          <h2 style={{marginBottom: '1rem'}}>Upload Proposal Kegiatan</h2>
          <p style={{color: 'var(--text-secondary)'}}>Format file: PDF (Max. 10MB)</p>
          <button 
            style={{
              background: 'var(--blue-accent)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              margin: '1.5rem 0',
              opacity: '0.7',
              cursor: 'not-allowed'
            }}
            disabled
          >
            Pilih File
          </button>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            *Fitur upload akan tersedia segera
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
