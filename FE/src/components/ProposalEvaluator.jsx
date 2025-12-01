import React, { useState } from 'react';
import { proposalEvaluationAPI } from '../services/api';

export default function ProposalEvaluator() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'summary', 'evaluation'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError('');
    }
  };

  const handleSummary = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await proposalEvaluationAPI.generateSummary(file);
      if (response.success) {
        setSummary(response.data);
        setActiveTab('summary');
      } else {
        setError(response.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await proposalEvaluationAPI.evaluateProposal(file);
      if (response.success) {
        setEvaluation(response.data);
        setActiveTab('evaluation');
      } else {
        setError(response.error || 'Failed to evaluate proposal');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'TERIMA': return '#4CAF50';
      case 'REVISI': return '#FFC107';
      case 'TOLAK': return '#F44336';
      default: return '#999';
    }
  };

  const getScoreColor = (score, maxScore = 75) => {
    const percent = (score / maxScore) * 100;
    if (percent >= 80) return '#4CAF50';
    if (percent >= 60) return '#FFC107';
    if (percent >= 40) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="evaluator-container">
      <style>{`
        .evaluator-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .evaluator-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .evaluator-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .evaluator-header p {
          color: #666;
          margin: 0;
          font-size: 15px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #eee;
        }

        .tab-btn {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #999;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }

        .tab-btn.active {
          color: #6ee7f9;
          border-bottom-color: #6ee7f9;
        }

        .tab-btn:hover {
          color: #333;
        }

        .upload-section {
          background: white;
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s;
        }

        .upload-section:hover {
          border-color: #6ee7f9;
          background: #f9feff;
        }

        .upload-section.dragover {
          border-color: #6ee7f9;
          background: #f0f9ff;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .upload-section h3 {
          font-size: 20px;
          margin: 0 0 10px 0;
          color: #333;
        }

        .upload-section p {
          color: #666;
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .file-input {
          display: none;
        }

        .upload-btn {
          display: inline-block;
          padding: 12px 32px;
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }

        .file-preview {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-preview-icon {
          font-size: 32px;
        }

        .file-preview-info {
          flex: 1;
          text-align: left;
        }

        .file-preview-name {
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .file-preview-size {
          font-size: 12px;
          color: #999;
          margin: 4px 0 0 0;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 30px;
          justify-content: center;
        }

        .action-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          color: white;
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }

        .action-btn.secondary {
          background: #f0f0f0;
          color: #333;
        }

        .action-btn.secondary:hover {
          background: #e0e0e0;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #6ee7f9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Summary Section */
        .summary-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .summary-item {
          margin-bottom: 20px;
        }

        .summary-item h3 {
          font-size: 14px;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 8px 0;
        }

        .summary-item p {
          font-size: 16px;
          color: #333;
          margin: 0;
          line-height: 1.6;
        }

        /* Evaluation Section */
        .evaluation-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .evaluation-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        .eval-card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .eval-card h3 {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px 0;
        }

        .eval-score {
          font-size: 36px;
          font-weight: 700;
          margin: 0;
        }

        .eval-recommendation {
          font-size: 18px;
          font-weight: 700;
          padding: 12px;
          border-radius: 6px;
          color: white;
          text-transform: uppercase;
          margin: 12px 0 0 0;
        }

        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin: 30px 0;
        }

        .score-item {
          background: #f9f9f9;
          border-left: 4px solid #6ee7f9;
          padding: 16px;
          border-radius: 8px;
        }

        .score-item h4 {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #333;
        }

        .score-bar {
          background: #e0e0e0;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #6ee7f9, #8b5cf6);
          width: 0%;
        }

        .score-value {
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }

        .score-reason {
          font-size: 13px;
          color: #666;
          margin: 8px 0 0 0;
        }

        .score-improvement {
          font-size: 13px;
          color: #FF9800;
          margin: 8px 0 0 0;
          font-style: italic;
        }

        .strengths-weaknesses {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 30px 0;
        }

        .strength-list, .weakness-list {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .strength-list h3, .weakness-list h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 16px 0;
        }

        .strength-list h3 {
          color: #4CAF50;
        }

        .weakness-list h3 {
          color: #F44336;
        }

        .strength-list ul, .weakness-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .strength-list li, .weakness-list li {
          padding: 8px 0 8px 24px;
          position: relative;
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }

        .strength-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #4CAF50;
          font-weight: bold;
        }

        .weakness-list li:before {
          content: "!";
          position: absolute;
          left: 0;
          color: #F44336;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .evaluation-header {
            grid-template-columns: 1fr;
          }

          .strengths-weaknesses {
            grid-template-columns: 1fr;
          }

          .scores-grid {
            grid-template-columns: 1fr;
          }

          .upload-section {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="evaluator-header">
        <h1>📋 Proposal Evaluator</h1>
        <p>AI-powered proposal analysis & evaluation system</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
        {summary && (
          <button
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
        )}
        {evaluation && (
          <button
            className={`tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluation')}
          >
            Evaluation
          </button>
        )}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          <div
            className="upload-section"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('dragover');
            }}
            onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
            onDrop={(e) => {
              handleDrop(e);
              e.currentTarget.classList.remove('dragover');
            }}
          >
            <div className="upload-icon">📄</div>
            <h3>Upload Proposal Document</h3>
            <p>Drag and drop your file here, or click to browse</p>
            <input
              type="file"
              id="file-input"
              className="file-input"
              onChange={handleFileChange}
              accept=".pdf,.txt,.md,.doc,.docx,.xls,.xlsx"
            />
            <label htmlFor="file-input" className="upload-btn">
              Choose File
            </label>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
              Supported formats: PDF, TXT, Markdown, Word, Excel
            </p>
          </div>

          {file && (
            <>
              <div className="file-preview">
                <div className="file-preview-icon">📎</div>
                <div className="file-preview-info">
                  <p className="file-preview-name">{fileName}</p>
                  <p className="file-preview-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="action-btn primary"
                  onClick={handleSummary}
                  disabled={loading}
                >
                  {loading && <div className="loading-spinner" />}
                  Generate Summary
                </button>
                <button
                  className="action-btn primary"
                  onClick={handleEvaluate}
                  disabled={loading}
                >
                  {loading && <div className="loading-spinner" />}
                  Evaluate Proposal
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    setFile(null);
                    setFileName('');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && summary && (
        <div className="summary-section">
          <div className="summary-item">
            <h3>File</h3>
            <p>{summary.filename}</p>
          </div>
          <div className="summary-item">
            <h3>Statistics</h3>
            <p>
              {summary.textLength} characters • {summary.words} words
            </p>
          </div>
          <div className="summary-item">
            <h3>Summary</h3>
            <p>{summary.summary}</p>
          </div>
        </div>
      )}

      {/* Evaluation Tab */}
      {activeTab === 'evaluation' && evaluation && (
        <div className="evaluation-section">
          <div className="evaluation-header">
            <div className="eval-card">
              <h3>Total Score</h3>
              <p className="eval-score" style={{ color: getScoreColor(evaluation.evaluation.total_score) }}>
                {evaluation.evaluation.total_score}
              </p>
              <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
                out of 75 points
              </p>
            </div>
            <div className="eval-card">
              <h3>Recommendation</h3>
              <div
                className="eval-recommendation"
                style={{ background: getRecommendationColor(evaluation.evaluation.recommendation) }}
              >
                {evaluation.evaluation.recommendation}
              </div>
            </div>
            <div className="eval-card">
              <h3>File Info</h3>
              <p style={{ fontSize: '14px', color: '#333', margin: '0' }}>
                {evaluation.filename}
              </p>
              <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
                {evaluation.textLength} characters
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ marginTop: 0 }}>Parameter Scores</h3>
            <div className="scores-grid">
              {evaluation.evaluation.scores.map((score, idx) => (
                <div key={idx} className="score-item">
                  <h4>{score.parameter}</h4>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{ width: `${(score.score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="score-value">{score.score}/5</div>
                  {score.reason && <p className="score-reason"><strong>Reason:</strong> {score.reason}</p>}
                  {score.improvement && <p className="score-improvement"><strong>Improvement:</strong> {score.improvement}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="strengths-weaknesses">
            <div className="strength-list">
              <h3>✓ Strengths</h3>
              <ul>
                {evaluation.evaluation.strengths?.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
            <div className="weakness-list">
              <h3>! Weaknesses</h3>
              <ul>
                {evaluation.evaluation.weaknesses?.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
