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
  const [step, setStep] = useState('form'); // 'form', 'success'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
    if (droppedFile) {
      setFile(droppedFile);
    }
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

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Create proposal as draft
      const createRes = await proposalAPI.createProposal(formData, file);
      if (!createRes.success) {
        setError(createRes.error || 'Failed to create proposal');
        return;
      }

      const proposalId = createRes.data._id;
      
      // Step 2: Submit the proposal
      const submitRes = await proposalAPI.submitProposal(proposalId);
      if (!submitRes.success) {
        setError(submitRes.error || 'Failed to submit proposal');
        return;
      }

      setSuccess('Proposal submitted successfully!');
      setStep('success');
      
      // Reset form
      setFormData({ title: '', category: '', description: '', content: '' });
      setFile(null);

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(createRes.data);
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        resetAndClose();
      }, 2000);
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
          <h2>Submit New Proposal</h2>
          <button
            style={styles.closeBtn}
            onClick={resetAndClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Title <span style={{ color: 'red' }}>*</span>
              </label>
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
              <small style={styles.hint}>
                {formData.title.length}/200 characters
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Category <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={styles.input}
                disabled={loading}
              >
                <option value="">-- Select Category --</option>
                <option value="academic">Academic</option>
                <option value="event">Event</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Description <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your proposal briefly"
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                rows={4}
                disabled={loading}
                maxLength={1000}
              />
              <small style={styles.hint}>
                {formData.description.length}/1000 characters
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Detailed Content
              </label>
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
                  borderColor: file ? '#4CAF50' : '#ddd',
                  backgroundColor: file ? '#f1f8f4' : '#fafafa'
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
                    <p style={styles.fileIcon}>📄</p>
                    <p style={styles.fileName}>{file.name}</p>
                    <small>{(file.size / 1024).toFixed(2)} KB</small>
                    <button
                      type="button"
                      style={styles.removeFileBtn}
                      onClick={() => setFile(null)}
                      disabled={loading}
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div style={styles.dropZoneContent}>
                    <p style={styles.dropZoneIcon}>📤</p>
                    <p>Drag and drop your file here, or click to browse</p>
                    <small>Supported: PDF, DOC, DOCX, TXT, MD, XLS, XLSX (Max 10MB)</small>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>⚠️</span> {error}
              </div>
            )}

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={resetAndClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.successMessage}>
            <div style={styles.successIcon}>✓</div>
            <h3>Success!</h3>
            <p>Your proposal has been submitted successfully.</p>
            <p>You can view and manage it in the Proposals section.</p>
            <button
              style={styles.okBtn}
              onClick={resetAndClose}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'slideIn 0.3s ease-out'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e0e0e0'
    }
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
    color: '#333',
    fontSize: '14px'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px'
  },
  dropZone: {
    border: '2px dashed #ddd',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#fafafa'
  },
  fileInput: {
    display: 'none'
  },
  dropZoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  dropZoneIcon: {
    fontSize: '32px',
    margin: 0
  },
  fileInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  fileIcon: {
    fontSize: '28px',
    margin: 0
  },
  fileName: {
    fontWeight: '500',
    margin: '8px 0 0 0',
    wordBreak: 'break-all'
  },
  removeFileBtn: {
    marginTop: '12px',
    padding: '6px 12px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  errorMessage: {
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorIcon: {
    fontSize: '16px'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '12px'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    color: '#333'
  },
  submitBtn: {
    padding: '10px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
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
  successIcon: {
    fontSize: '64px',
    color: '#4CAF50'
  },
  okBtn: {
    padding: '10px 32px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '16px'
  }
};
