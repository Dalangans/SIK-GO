import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referrerPage, setReferrerPage] = useState('/proposals');

  useEffect(() => {
    // Simpan halaman referrer dari location state atau gunakan default
    const state = window.history.state?.usr || {};
    setReferrerPage(state.from || '/proposals');
  }, []);

  useEffect(() => {
    fetchProposalDetail();
  }, [id]);

  const fetchProposalDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/proposals/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setProposal(data.data);
      } else {
        setError(data.error || 'Failed to fetch proposal');
      }
    } catch (err) {
      setError('Error loading proposal: ' + err.message);
      console.error('Error fetching proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#fbbf24',
      'submitted': '#60a5fa',
      'under_review': '#a78bfa',
      'approved': '#34d399',
      'rejected': '#f87171',
      'revision_needed': '#fb923c'
    };
    return colors[status] || '#9ca3af';
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>Oops!</h2>
          <p>{error || 'Proposal not found'}</p>
          <button
            style={styles.backBtn}
            onClick={() => navigate('/proposals')}
          >
            Back to Proposals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        :root {
          --font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        html, body, #root {
          margin: 0;
          padding: 0;
          font-family: var(--font-stack);
        }

        body {
          background: radial-gradient(1400px 900px at 10% 10%, #1a1f42 0%, #0f1429 45%, #0b0e1e 70%, #060712 100%);
          font-family: var(--font-stack);
          -webkit-font-smoothing: antialiased;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .proposal-detail-container { 
          animation: slideIn 0.3s ease-out;
          font-family: var(--font-stack);
        }
      `}</style>

      <div style={styles.proposalDetailContainer} className="proposal-detail-container">
        {/* Header dengan Back Button */}
        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={() => navigate(referrerPage)}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.12)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            ← Back
          </button>
          <h1 style={styles.title}>{proposal.title}</h1>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          {/* Status Bar */}
          <div style={styles.statusBar}>
            <div>
              <span style={styles.label}>Status</span>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: `${getStatusColor(proposal.status)}20`,
                  borderColor: getStatusColor(proposal.status),
                  color: getStatusColor(proposal.status)
                }}
              >
                {getStatusLabel(proposal.status)}
              </span>
            </div>
            <div>
              <span style={styles.label}>Category</span>
              <span style={styles.category}>{proposal.category}</span>
            </div>
          </div>

          {/* Meta Information */}
          <div style={styles.metaSection}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Created</span>
              <span style={styles.metaValue}>
                {new Date(proposal.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {proposal.updatedAt && (
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Last Updated</span>
                <span style={styles.metaValue}>
                  {new Date(proposal.updatedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Description</h2>
            <p style={styles.sectionContent}>{proposal.description}</p>
          </div>

          {/* Content/Details */}
          {proposal.content && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Details</h2>
              <p style={styles.sectionContent}>{proposal.content}</p>
            </div>
          )}

          {/* File Information */}
          {proposal.fileUrl && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Attached File</h2>
              <div style={styles.fileBox}>
                <span style={styles.fileIcon}>📎</span>
                <a
                  href={proposal.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.fileLink}
                >
                  {proposal.fileName || 'Download File'}
                </a>
              </div>
            </div>
          )}

          {/* Manual Review Comment */}
          {proposal.manualReview && (
            <div style={{...styles.section, borderLeft: `4px solid ${getStatusColor(proposal.status)}`}}>
              <h2 style={styles.sectionTitle}>Reviewer Feedback</h2>
              <div style={styles.reviewBox}>
                <p style={styles.reviewerName}>
                  From: <strong>{proposal.manualReview.reviewedBy || 'Admin'}</strong>
                </p>
                {proposal.manualReview.comment && (
                  <p style={styles.reviewComment}>{proposal.manualReview.comment}</p>
                )}
                {proposal.manualReview.reviewedAt && (
                  <p style={styles.reviewDate}>
                    {new Date(proposal.manualReview.reviewedAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AI Analysis Results (if available) */}
          {proposal.aiAnalysis && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>AI Analysis Results</h2>
              <div style={styles.analysisBox}>
                {proposal.aiAnalysis.summary && (
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>Summary</span>
                    <p>{proposal.aiAnalysis.summary}</p>
                  </div>
                )}
                {proposal.aiAnalysis.recommendation && (
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisLabel}>Recommendation</span>
                    <p>{proposal.aiAnalysis.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actionBar}>
            {proposal.status === 'draft' && (
              <button
                style={styles.editBtn}
                onClick={() => navigate(`/proposals/${proposal._id}/edit`)}
                onMouseOver={(e) => e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)'}
                onMouseOut={(e) => e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'}
              >
                Edit & Submit
              </button>
            )}
            {proposal.status === 'revision_needed' && (
              <button
                style={styles.revisionBtn}
                onClick={() => navigate(`/proposals/${proposal._id}/revise`)}
                onMouseOver={(e) => e.target.style.boxShadow = '0 6px 16px rgba(251, 146, 60, 0.4)'}
                onMouseOut={(e) => e.target.style.boxShadow = '0 4px 12px rgba(251, 146, 60, 0.3)'}
              >
                Make Revisions
              </button>
            )}
            <button
              style={styles.closeBtn}
              onClick={() => navigate(referrerPage)}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.12)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Background Bottom */}
      <div style={styles.backgroundBottom}>
        <img src="/BackgroundBawah.svg" alt="Background" style={styles.backgroundImg} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(1400px 900px at 10% 10%, #1a1f42 0%, #0f1429 45%, #0b0e1e 70%, #060712 100%)',
    overflow: 'auto',
    paddingTop: '60px',
    paddingBottom: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#cfd6e4'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(110, 231, 249, 0.2)',
    borderTopColor: '#6ee7f9',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  errorBox: {
    maxWidth: '500px',
    margin: '100px auto',
    padding: '40px',
    background: 'radial-gradient(1400px 900px at 10% 10%, rgba(26, 31, 66, 0.95) 0%, rgba(15, 20, 41, 0.95) 45%, rgba(11, 14, 30, 0.95) 70%, rgba(6, 7, 18, 0.95) 100%)',
    border: '1px solid rgba(110, 231, 249, 0.15)',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#cfd6e4'
  },
  proposalDetailContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px',
    background: 'radial-gradient(1400px 900px at 10% 10%, rgba(26, 31, 66, 0.95) 0%, rgba(15, 20, 41, 0.95) 45%, rgba(11, 14, 30, 0.95) 70%, rgba(6, 7, 18, 0.95) 100%)',
    border: '1px solid rgba(110, 231, 249, 0.15)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    position: 'relative',
    zIndex: 10
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(110, 231, 249, 0.1)'
  },
  backBtn: {
    padding: '10px 16px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#cfd6e4',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  title: {
    color: '#cfd6e4',
    fontSize: '28px',
    margin: 0,
    flex: 1
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  statusBar: {
    display: 'flex',
    gap: '24px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(110, 231, 249, 0.1)',
    borderRadius: '12px',
    flexWrap: 'wrap'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  label: {
    display: 'block',
    color: '#97a2b8',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  category: {
    display: 'inline-block',
    padding: '6px 12px',
    background: 'rgba(110, 231, 249, 0.1)',
    border: '1px solid rgba(110, 231, 249, 0.2)',
    color: '#6ee7f9',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  metaSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  metaItem: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(110, 231, 249, 0.1)',
    borderRadius: '10px'
  },
  metaLabel: {
    display: 'block',
    color: '#97a2b8',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px'
  },
  metaValue: {
    color: '#cfd6e4',
    fontSize: '14px',
    fontWeight: '500'
  },
  section: {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(110, 231, 249, 0.1)',
    borderRadius: '10px'
  },
  sectionTitle: {
    color: '#6ee7f9',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 12px 0'
  },
  sectionContent: {
    color: '#cfd6e4',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap'
  },
  fileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(110, 231, 249, 0.08)',
    border: '1px dashed rgba(110, 231, 249, 0.3)',
    borderRadius: '8px'
  },
  fileIcon: {
    fontSize: '20px'
  },
  fileLink: {
    color: '#6ee7f9',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  reviewBox: {
    padding: '16px',
    background: 'rgba(139, 92, 246, 0.08)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '8px'
  },
  reviewerName: {
    color: '#8b5cf6',
    fontSize: '13px',
    margin: '0 0 8px 0'
  },
  reviewComment: {
    color: '#cfd6e4',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '8px 0',
    whiteSpace: 'pre-wrap'
  },
  reviewDate: {
    color: '#97a2b8',
    fontSize: '12px',
    margin: '8px 0 0 0'
  },
  analysisBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  analysisItem: {
    padding: '12px',
    background: 'rgba(110, 231, 249, 0.08)',
    border: '1px solid rgba(110, 231, 249, 0.2)',
    borderRadius: '8px'
  },
  analysisLabel: {
    display: 'block',
    color: '#6ee7f9',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px'
  },
  actionBar: {
    display: 'flex',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(110, 231, 249, 0.1)',
    flexWrap: 'wrap'
  },
  editBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #6ee7f9, #8b5cf6)',
    color: '#0b0f1f',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
  },
  revisionBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #fb923c, #f97316)',
    color: '#0b0f1f',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(251, 146, 60, 0.3)'
  },
  closeBtn: {
    padding: '10px 24px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#cfd6e4',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  backgroundBottom: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '100%',
    height: 'auto',
    pointerEvents: 'none',
    zIndex: 0
  },
  backgroundImg: {
    width: '100%',
    height: 'auto',
    display: 'block',
    opacity: 0.4
  }
};
