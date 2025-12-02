import React, { useState, useEffect } from 'react';
import { proposalAPI } from '../services/api';

export default function ProposalList() {
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
      const res = await proposalAPI.getMyProposals();
      if (res.success) {
        setProposals(res.data || []);
      } else {
        setError(res.error || 'Failed to load proposals');
      }
    } catch (err) {
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
                    <h3 style={styles.cardTitle}>{proposal.title}</h3>
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
    alignItems: 'center',
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
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cardBody: {
    fontSize: '14px',
    color: '#666'
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
