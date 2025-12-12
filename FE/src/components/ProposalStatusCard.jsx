import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/proposalStatus.css';

export default function ProposalStatusCard() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProposals();
  }, []);

  const fetchUserProposals = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/proposals/my-proposals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setProposals(data.data);
      } else {
        setError(data.error || 'Failed to fetch proposals');
      }
    } catch (err) {
      setError('Error loading proposals: ' + err.message);
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return '📝';
      case 'submitted':
        return '📤';
      case 'under_review':
        return '🔍';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'revision_needed':
        return '🔄';
      default:
        return '📄';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'under_review': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'revision_needed': 'Revision Needed'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'submitted':
        return 'status-submitted';
      case 'under_review':
        return 'status-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'revision_needed':
        return 'status-revision';
      default:
        return 'status-default';
    }
  };

  if (!localStorage.getItem('authToken')) {
    return null; // Don't show for unauthenticated users
  }

  return (
    <section className="proposal-status-section">
      <div className="proposal-status-container">
        {loading ? (
          <div className="proposal-status-loading">
            <div className="spinner"></div>
            <p>Loading your proposals...</p>
          </div>
        ) : error ? (
          <div className="proposal-status-error">
            <p>{error}</p>
            <button onClick={fetchUserProposals} className="retry-btn">
              Retry
            </button>
          </div>
        ) : proposals.length === 0 ? (
          <div className="proposal-status-empty">
            <div className="empty-icon">📭</div>
            <p>No proposals yet</p>
            <Link to="/proposals" className="create-proposal-link">
              Create your first proposal
            </Link>
          </div>
        ) : (
          <div className="proposal-status-list">
            {proposals.map((proposal) => (
              <div key={proposal._id} className={`proposal-card ${getStatusColor(proposal.status)}`}>
                <div className="proposal-card-header">
                  <div className="proposal-title-section">
                    <span className="proposal-icon">{getStatusIcon(proposal.status)}</span>
                    <div className="proposal-title-info">
                      <h3 className="proposal-title">{proposal.title}</h3>
                      <span className="proposal-category">{proposal.category}</span>
                    </div>
                  </div>
                  <div className={`proposal-status-badge ${getStatusColor(proposal.status)}`}>
                    {getStatusLabel(proposal.status)}
                  </div>
                </div>

                <p className="proposal-description">{proposal.description}</p>

                <div className="proposal-meta">
                  <span className="meta-item">
                    Created: {new Date(proposal.createdAt).toLocaleDateString()}
                  </span>
                  {proposal.updatedAt && (
                    <span className="meta-item">
                      Updated: {new Date(proposal.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {proposal.manualReview && (
                  <div className="proposal-manual-review">
                    <p className="review-label">Reviewer Comment:</p>
                    <p className="review-comment">{proposal.manualReview.comment}</p>
                  </div>
                )}

                <div className="proposal-actions">
                  <Link to={`/proposals/${proposal._id}`} className="action-btn view-btn">
                    View Details
                  </Link>
                  {proposal.status === 'draft' && (
                    <Link to={`/proposals/${proposal._id}`} className="action-btn edit-btn">
                      Edit & Submit
                    </Link>
                  )}
                  {proposal.status === 'revision_needed' && (
                    <Link to={`/proposals/${proposal._id}`} className="action-btn revision-btn">
                      Make Revisions
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
