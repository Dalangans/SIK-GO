import React, { useState, useEffect } from 'react';
import { proposalAPI } from '../services/api';

export default function ProposalList() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadProposals();
  }, [filterStatus]);

  const loadProposals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = filterStatus 
        ? await proposalAPI.getAllProposals(filterStatus)
        : await proposalAPI.getMyProposals();
      setProposals(data.data || []);
    } catch (err) {
      setError(err.message || 'Error loading proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus proposal ini?')) return;

    try {
      await proposalAPI.deleteProposal(id);
      setProposals(proposals.filter(p => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (id) => {
    if (!window.confirm('Submit proposal ini untuk review?')) return;

    try {
      await proposalAPI.submitProposal(id);
      loadProposals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAIReview = async (id) => {
    setLoading(true);
    try {
      await proposalAPI.generateAIReview(id);
      loadProposals();
      alert('AI Review telah dihasilkan!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: '#FF9800',
      submitted: '#2196F3',
      reviewing: '#9C27B0',
      approved: '#4CAF50',
      rejected: '#F44336'
    };
    return (
      <span style={{
        backgroundColor: colors[status] || '#999',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <h2>Daftar Proposal</h2>
      
      {error && <div style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <label>Filter Status: </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px', marginLeft: '10px' }}
        >
          <option value="">Semua</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {proposals.length === 0 ? (
        <p>Belum ada proposal.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {proposals.map(proposal => (
            <div key={proposal._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{proposal.title}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '12px' }}>
                    Kategori: {proposal.category}
                  </p>
                </div>
                {getStatusBadge(proposal.status)}
              </div>
              
              <p style={{ margin: '10px 0', color: '#666' }}>{proposal.description}</p>

              {proposal.aiReview?.score && (
                <div style={{
                  backgroundColor: '#e3f2fd',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  <strong>AI Score: {proposal.aiReview.score}/100</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                    {proposal.aiReview.summary}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {proposal.status === 'draft' && (
                  <>
                    <button
                      onClick={() => handleSubmit(proposal._id)}
                      style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        padding: '5px 15px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => handleDelete(proposal._id)}
                      style={{
                        backgroundColor: '#F44336',
                        color: 'white',
                        border: 'none',
                        padding: '5px 15px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Hapus
                    </button>
                  </>
                )}
                
                {proposal.status === 'submitted' && !proposal.aiReview?.score && (
                  <button
                    onClick={() => handleAIReview(proposal._id)}
                    style={{
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      padding: '5px 15px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    💡 Generate AI Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={loadProposals}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Refresh
      </button>
    </div>
  );
}
