import React, { useState } from 'react';
import { sikDocumentAPI } from '../services/api';
import '../styles/documentScanner.css';

export default function DocumentScanner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '#e3f2fd';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#f5f5f5';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '#f5f5f5';
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);

      const res = await sikDocumentAPI.analyzeSIKDocument(formData);
      
      if (res.success) {
        setResult(res.data);
        setFile(null);
        setFileName('');
      } else {
        setError(res.error || 'Failed to analyze document');
      }
    } catch (err) {
      setError(err.message || 'Error analyzing document');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileName('');
    setError('');
    setResult(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📄 Analisis Dokumen SIK</h1>
        <p>Unggah dokumen untuk analisis otomatis menggunakan AI</p>
      </div>

      <div style={styles.content}>
        {!result ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* File Upload Area */}
            <div
              style={styles.uploadArea}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div style={styles.uploadContent}>
                <div style={styles.uploadIcon}>📁</div>
                <h3>Drag and drop file here</h3>
                <p>or click to select</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  style={styles.hiddenInput}
                  id="fileInput"
                />
                <label htmlFor="fileInput" style={styles.browseBtn}>
                  Browse Files
                </label>
              </div>
            </div>

            {/* Selected File Info */}
            {fileName && (
              <div style={styles.fileInfo}>
                <span>📄 {fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFileName('');
                  }}
                  style={styles.removeFileBtn}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={styles.errorMessage}>
                <strong>⚠ Error:</strong> {error}
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.actions}>
              <button
                type="submit"
                disabled={!file || loading}
                style={{
                  ...styles.submitBtn,
                  opacity: !file || loading ? 0.6 : 1,
                  cursor: !file || loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze Document'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                style={styles.clearBtn}
              >
                Clear
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.resultSection}>
            <div style={styles.resultHeader}>
              <h2>✓ Analysis Result</h2>
              <button onClick={handleClear} style={styles.backBtn}>
                ← Analyze Another
              </button>
            </div>

            <div style={styles.resultContent}>
              {result.summary && (
                <div style={styles.resultBox}>
                  <h3>Summary</h3>
                  <p>{result.summary}</p>
                </div>
              )}

              {result.status && (
                <div style={styles.resultBox}>
                  <h3>Status</h3>
                  <p style={{ color: result.status === 'valid' ? '#4CAF50' : '#f44336' }}>
                    {result.status.toUpperCase()}
                  </p>
                </div>
              )}

              {result.issues && result.issues.length > 0 && (
                <div style={styles.resultBox}>
                  <h3>Issues Found</h3>
                  <ul style={styles.issuesList}>
                    {result.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div style={styles.resultBox}>
                  <h3>Recommendations</h3>
                  <ul style={styles.recommendationsList}>
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
    padding: '20px'
  },
  header: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  uploadArea: {
    border: '2px dashed #2196F3',
    borderRadius: '8px',
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  hiddenInput: {
    display: 'none'
  },
  browseBtn: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  fileInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: '12px 16px',
    borderRadius: '4px',
    border: '1px solid #2196F3'
  },
  removeFileBtn: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: '4px',
    fontSize: '14px'
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  submitBtn: {
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  clearBtn: {
    padding: '12px 20px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  resultSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '15px',
    borderBottom: '2px solid #ddd'
  },
  backBtn: {
    padding: '10px 16px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  resultContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  resultBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  issuesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  recommendationsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }
};
