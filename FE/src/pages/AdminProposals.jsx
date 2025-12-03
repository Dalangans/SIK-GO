import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminProposalList from '../components/AdminProposalList';

export default function AdminProposals() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cek apakah user adalah admin
    const userData = JSON.parse(localStorage.getItem('sikgo_user') || '{}');
    if (userData.role !== 'admin') {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header dengan Info Admin Card */}
      <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1>Manajemen Proposal - Admin</h1>
          
          {/* Admin Info Card */}
          <div style={styles.adminCard}>
            <div style={styles.adminInfo}>
              <div>
                <p style={styles.adminLabel}>👤 Admin User</p>
                <p style={styles.adminName}>{user.name}</p>
                <p style={styles.adminEmail}>{user.email}</p>
              </div>
              <div style={styles.roleBadge}>
                <span style={styles.roleText}>ADMIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #ddd'
        }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'list' ? '#4CAF50' : '#ccc',
              color: activeTab === 'list' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Daftar Proposal Semua Student
          </button>
        </div>

        {activeTab === 'list' && <AdminProposalList />}
      </div>
    </div>
  );
}

const styles = {
  adminCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '15px 20px',
    marginTop: '15px',
    backdropFilter: 'blur(10px)'
  },
  adminInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  adminLabel: {
    fontSize: '12px',
    opacity: 0.8,
    margin: 0,
    marginBottom: '5px'
  },
  adminName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '3px'
  },
  adminEmail: {
    fontSize: '13px',
    opacity: 0.9,
    margin: 0
  },
  roleBadge: {
    backgroundColor: '#4CAF50',
    padding: '10px 20px',
    borderRadius: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  roleText: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: 'white'
  }
};
