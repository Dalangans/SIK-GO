import React, { useState } from 'react';
import { proposalAPI } from '../services/api';

export default function ProposalForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'academic',
    description: '',
    content: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await proposalAPI.createProposal(formData, file);
      setSuccess('Proposal berhasil dibuat!');
      setFormData({
        title: '',
        category: 'academic',
        description: '',
        content: '',
      });
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Gagal membuat proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Buat Proposal</h2>
      
      {error && <div style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: 'green', padding: '10px', marginBottom: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Judul Proposal *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Masukkan judul proposal"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Kategori *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          >
            <option value="academic">Akademik</option>
            <option value="event">Event</option>
            <option value="research">Penelitian</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Deskripsi Singkat *</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Deskripsi singkat proposal Anda"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Konten Proposal *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Masukkan konten lengkap proposal..."
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '200px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Upload File (Opsional)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Format: PDF, DOC, DOCX, TXT (Max 10MB)
          </small>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Membuat...' : 'Buat Proposal'}
        </button>
      </form>
    </div>
  );
}
