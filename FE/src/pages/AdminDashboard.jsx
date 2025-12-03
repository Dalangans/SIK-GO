import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cek apakah user adalah admin
    const userData = JSON.parse(localStorage.getItem('sikgo_user') || '{}');
    if (userData.role !== 'admin') {
      navigate('/login');
      return;
    }
    setUser(userData);
    loadAllProposals();
  }, [navigate]);

  const loadAllProposals = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const envBase = import.meta.env.VITE_API_URL?.trim();
      const base = (envBase && envBase !== '') ? envBase.replace(/\/+$/, '') : 'http://localhost:3000';
      
      console.log('Loading proposals from:', `${base}/api/proposal/admin/all`);
      
      const res = await fetch(`${base}/api/proposals/admin/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', res.status);
      const json = await res.json().catch(() => ({}));
      console.log('Response data:', json);

      if (res.ok && json.success) {
        setProposals(json.data || []);
      } else {
        setError(json.error || json.message || `Failed to load proposals (${res.status})`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error loading proposals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#999';
    }
  };

  const filteredProposals = proposals.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handleStatusChange = async (proposalId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const envBase = import.meta.env.VITE_API_URL?.trim();
      const base = (envBase && envBase !== '') ? envBase.replace(/\/+$/, '') : 'http://localhost:3000';

      const res = await fetch(`${base}/api/proposals/${proposalId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        // Update proposal di local state
        setProposals(proposals.map(p => 
          p._id === proposalId ? { ...p, status: newStatus } : p
        ));
      } else {
        alert(json.error || 'Failed to update proposal');
      }
    } catch (err) {
      alert('Error updating proposal');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name || 'Admin'}</p>
        </div>
        <div style={styles.loadingContainer}>
          <p>Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.name || 'Admin'}</p>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.role}>👤 {user?.role?.toUpperCase()}</span>
            <span style={styles.email}>{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Stats Section */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeftColor: '#ff9800' }}>
            <div style={styles.statNumber}>
              {proposals.filter(p => p.status === 'pending').length}
            </div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#4CAF50' }}>
            <div style={styles.statNumber}>
              {proposals.filter(p => p.status === 'approved').length}
            </div>
            <div style={styles.statLabel}>Approved</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#f44336' }}>
            <div style={styles.statNumber}>
              {proposals.filter(p => p.status === 'rejected').length}
            </div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#2196F3' }}>
            <div style={styles.statNumber}>
              {proposals.length}
            </div>
            <div style={styles.statLabel}>Total</div>
          </div>
        </div>

        {/* Filter Section */}
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}>Filter by Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorContainer}>
            <p>{error}</p>
          </div>
        )}

        {/* Proposals Table */}
        {filteredProposals.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No proposals found</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Student Email</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Upload Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal, idx) => (
                  <tr key={proposal._id} style={styles.tr}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>
                      <strong>{proposal.title || 'N/A'}</strong>
                    </td>
                    <td style={styles.td}>
                      {proposal.user?.name || 'Unknown User'}
                    </td>
                    <td style={styles.td}>
                      {proposal.user?.email || 'Unknown Email'}
                    </td>
                    <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proposal.description || 'No description'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(proposal.status),
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {proposal.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleStatusChange(proposal._id, 'approved')}
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: '#4CAF50',
                            opacity: proposal.status === 'approved' ? 0.5 : 1,
                            cursor: proposal.status === 'approved' ? 'not-allowed' : 'pointer'
                          }}
                          disabled={proposal.status === 'approved'}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleStatusChange(proposal._id, 'rejected')}
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: '#f44336',
                            opacity: proposal.status === 'rejected' ? 0.5 : 1,
                            cursor: proposal.status === 'rejected' ? 'not-allowed' : 'pointer'
                          }}
                          disabled={proposal.status === 'rejected'}
                          title="Reject"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '30px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  role: {
    backgroundColor: '#4CAF50',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  email: {
    fontSize: '14px',
    opacity: 0.9,
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '20px auto',
    padding: '0 20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '5px solid #ccc',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
  },
  filterSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  filterLabel: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd',
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '14px',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '15px',
    fontSize: '14px',
    color: '#333',
  },
  statusBadge: {
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  loadingContainer: {
    maxWidth: '1400px',
    margin: '40px auto',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#666',
  }
};
