import React, { useState } from 'react';
import { proposalAPI } from '../services/api';

export default function ProposalSubmitModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    content: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('form');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      const createRes = await proposalAPI.createProposal(formData, file);
      if (!createRes.success) {
        setError(createRes.error || 'Failed to create proposal');
        return;
      }

      const proposalId = createRes.data._id;
      const submitRes = await proposalAPI.submitProposal(proposalId);
      if (!submitRes.success) {
        setError(submitRes.error || 'Failed to submit proposal');
        return;
      }

      setSuccess('Proposal submitted successfully!');
      setStep('success');
      setFormData({ title: '', category: '', description: '', content: '' });
      setFile(null);

      if (onSuccess) {
        onSuccess(createRes.data);
      }

      setTimeout(() => resetAndClose(), 2000);
    } catch (err) {
      setError(err.message || 'Error submitting proposal');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setFormData({ title: '', category: '', description: '', content: '' });
    setFile(null);
    setError('');
    setSuccess('');
    setStep('form');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={resetAndClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Submit New Proposal</h2>
          <button
            style={styles.closeBtn}
            onClick={resetAndClose}
            type="button"
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.12)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            ×
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter proposal title"
                style={styles.input}
                disabled={loading}
                maxLength={200}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={styles.input}
                disabled={loading}
              >
                <option value="">Select a category</option>
                <option value="research">Research</option>
                <option value="project">Project</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of your proposal"
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                rows={4}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Additional Details (Optional)</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Add more detailed content (optional)"
                style={{ ...styles.input, minHeight: '150px', resize: 'vertical' }}
                rows={6}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload File (Optional)</label>
              <div
                style={{
                  ...styles.dropZone,
                  borderColor: file ? 'rgba(110, 231, 249, 0.5)' : 'rgba(110, 231, 249, 0.2)',
                  background: file ? 'rgba(110, 231, 249, 0.08)' : 'rgba(110, 231, 249, 0.05)'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                  disabled={loading}
                  accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx"
                />
                {file ? (
                  <div style={styles.fileInfo}>
                    <p style={styles.fileName}>{file.name}</p>
                    <small style={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</small>
                    <button
                      type="button"
                      style={styles.removeFileBtn}
                      onClick={() => setFile(null)}
                      disabled={loading}
                      onMouseOver={(e) => e.target.style.opacity = '0.9'}
                      onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div style={styles.dropZoneContent}>
                    <p style={styles.dropZoneText}>Drag and drop your file here, or click to browse</p>
                    <small style={styles.dropZoneHint}>Supported: PDF, DOC, DOCX, TXT, MD, XLS, XLSX</small>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={resetAndClose}
                disabled={loading}
                onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.12)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
                onMouseOver={(e) => !loading && (e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)')}
                onMouseOut={(e) => e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'}
              >
                {loading ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.successMessage}>
            <h3 style={styles.successTitle}>Success</h3>
            <p style={styles.successText}>Your proposal has been submitted successfully.</p>
            <p style={styles.successText}>You can view and manage it in the Proposals section.</p>
            <button
              style={styles.okBtn}
              onClick={resetAndClose}
              onMouseOver={(e) => e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)'}
              onMouseOut={(e) => e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    background: 'radial-gradient(1400px 900px at 10% 10%, rgba(26, 31, 66, 0.95) 0%, rgba(15, 20, 41, 0.95) 45%, rgba(11, 14, 30, 0.95) 70%, rgba(6, 7, 18, 0.95) 100%)',
    border: '1px solid rgba(110, 231, 249, 0.15)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)',
    animation: 'slideIn 0.3s ease-out'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(110, 231, 249, 0.1)',
    background: 'transparent'
  },
  modalTitle: {
    color: '#cfd6e4',
    margin: 0,
    fontSize: '20px',
    fontWeight: '600'
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#cfd6e4',
    padding: '4px 8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'all 0.2s',
    fontWeight: 'bold',
    lineHeight: '1'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#cfd6e4',
    fontSize: '14px'
  },
  input: {
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(110, 231, 249, 0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: '#cfd6e4',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  dropZone: {
    border: '2px dashed rgba(110, 231, 249, 0.2)',
    borderRadius: '10px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  fileInput: {
    display: 'none'
  },
  dropZoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  dropZoneText: {
    color: '#cfd6e4',
    margin: 0,
    fontSize: '14px',
    fontWeight: '500'
  },
  dropZoneHint: {
    color: '#97a2b8',
    fontSize: '12px'
  },
  fileInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  fileName: {
    fontWeight: '500',
    color: '#cfd6e4',
    margin: '8px 0 0 0',
    wordBreak: 'break-all'
  },
  fileSize: {
    color: '#97a2b8',
    fontSize: '12px'
  },
  removeFileBtn: {
    marginTop: '12px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  errorMessage: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff9a9a',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '12px'
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    color: '#cfd6e4'
  },
  submitBtn: {
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
  successMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    gap: '16px',
    textAlign: 'center'
  },
  successTitle: {
    color: '#6ee7f9',
    fontSize: '24px',
    margin: 0,
    fontWeight: '600'
  },
  successText: {
    color: '#cfd6e4',
    margin: '8px 0'
  },
  okBtn: {
    padding: '10px 32px',
    background: 'linear-gradient(135deg, #6ee7f9, #8b5cf6)',
    color: '#0b0f1f',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '16px',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.2s'
  }
};