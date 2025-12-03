import React, { useState, useEffect } from 'react';

export default function AdminProposalList() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const envBase = import.meta.env.VITE_API_URL?.trim();
      const base = (envBase && envBase !== '') ? envBase.replace(/\/+$/, '') : 'http://localhost:3000';
      
      const res = await fetch(`${base}/api/proposals/admin/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setProposals(json.data || []);
      } else {
        setError(json.error || 'Failed to load proposals');
      }
    } catch (err) {
      setError(err.message || 'Error loading proposals');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div style={styles.container}>
      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>Filter by Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Proposals</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={loadProposals} style={styles.refreshBtn}>
          ↻ Refresh
        </button>
      </div>

      {loading && <div style={styles.loadingState}>Loading proposals...</div>}

      {error && !loading && (
        <div style={styles.errorState}>
          <p>⚠ {error}</p>
          <button onClick={loadProposals} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredProposals.length > 0 ? (
            <div style={styles.proposalsList}>
              {filteredProposals.map((proposal) => (
                <div key={proposal._id} style={styles.proposalCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTitle}>{proposal.title}</h3>
                      {proposal.user && (
                        <p style={styles.studentInfo}>
                          📧 {proposal.user.name} ({proposal.user.email})
                        </p>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(proposal.status)
                      }}
                    >
                      {proposal.status}
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <p style={styles.category}>
                      <strong>Category:</strong> {proposal.category}
                    </p>
                    <p style={styles.description}>{proposal.description}</p>
                    {proposal.createdAt && (
                      <p style={styles.date}>
                        <strong>Created:</strong>{' '}
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons untuk Admin */}
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
                      title="Approve Proposal"
                    >
                      ✓ Approve
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
                      title="Reject Proposal"
                    >
                      ✕ Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(proposal._id, 'pending')}
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: '#ff9800',
                        opacity: proposal.status === 'pending' ? 0.5 : 1,
                        cursor: proposal.status === 'pending' ? 'not-allowed' : 'pointer'
                      }}
                      disabled={proposal.status === 'pending'}
                      title="Set to Pending"
                    >
                      ⟲ Pending
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>No proposals found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  filterSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee'
  },
  filterLabel: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  proposalsList: {
    display: 'grid',
    gap: '15px'
  },
  proposalCard: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  cardTitle: {
    margin: '0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  studentInfo: {
    margin: '5px 0 0 0',
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  cardBody: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px'
  },
  category: {
    margin: '8px 0',
    fontWeight: 'bold'
  },
  description: {
    margin: '8px 0',
    lineHeight: '1.5'
  },
  date: {
    margin: '8px 0',
    fontSize: '12px',
    color: '#999'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #eee'
  },
  actionBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.3s ease'
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
    fontSize: '14px'
  },
  errorState: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center'
  },
  retryBtn: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    fontSize: '14px'
  }
};
