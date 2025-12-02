import React, { useState } from 'react';
import { proposalAPI } from '../services/api';

export default function ProposalForm({ onSuccess }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.category || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await proposalAPI.createProposal(formData, file);
      if (res.success) {
        setSuccess('Proposal created successfully');
        setFormData({ title: '', category: '', description: '', content: '' });
        setFile(null);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to create proposal');
      }
    } catch (err) {
      setError(err.message || 'Error creating proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter proposal title"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={styles.input}
            required
          >
            <option value="">-- Select Category --</option>
            <option value="research">Research</option>
            <option value="project">Project</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter proposal description"
            style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
            rows={4}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Enter proposal content (optional)"
            style={{ ...styles.input, minHeight: '150px', resize: 'vertical' }}
            rows={6}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            style={styles.input}
          />
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}
        {success && <div style={styles.successMessage}>{success}</div>}

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Creating...' : 'Create Proposal'}
        </button>
      </form>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box'
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px'
  },
  successMessage: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #66bb6a',
    color: '#2e7d32',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px'
  }
};
