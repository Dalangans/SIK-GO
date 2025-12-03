import React, { useState } from 'react';
import { proposalEvaluationAPI, proposalAPI } from '../services/api';

export default function ProposalReviewModal({ proposal, onClose, onReviewSubmit }) {
  const [evalTab, setEvalTab] = useState('preview'); // 'preview', 'summary', 'evaluate'
  const [evalSummary, setEvalSummary] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [submitLoading, setSubmitLoading] = useState(false);

  if (!proposal) return null;

  const handleGenerateSummary = async () => {
    if (!proposal.filePath) {
      setEvalError('No file available for this proposal');
      return;
    }
    
    setEvalLoading(true);
    setEvalError('');
    try {
      const res = await proposalAPI.summarizeProposalByPath(proposal.filePath);
      if (res.success) {
        setEvalSummary(res.data);
        setEvalTab('summary');
      } else {
        setEvalError(res.error || 'Failed to generate summary');
      }
    } catch (err) {
      setEvalError(err.message || 'Error generating summary');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!proposal.filePath) {
      setEvalError('No file available for this proposal');
      return;
    }
    
    setEvalLoading(true);
    setEvalError('');
    
    console.log('Evaluating proposal:');
    console.log('  Proposal ID:', proposal._id);
    console.log('  Proposal Title:', proposal.title);
    console.log('  File Path:', proposal.filePath);
    
    try {
      const res = await proposalAPI.evaluateProposalByPath(proposal.filePath);
      if (res.success) {
        setEvalResult(res.data);
        setEvalTab('evaluate');
      } else {
        setEvalError(res.error || 'Failed to evaluate proposal');
      }
    } catch (err) {
      console.error('Evaluation error details:', err);
      setEvalError(err.message || 'Error evaluating proposal');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitLoading(true);
    try {
      const res = await proposalAPI.submitManualReview(proposal._id, reviewComments, reviewStatus);
      if (res.success) {
        onReviewSubmit && onReviewSubmit();
        onClose();
      } else {
        setEvalError(res.error || 'Failed to submit review');
      }
    } catch (err) {
      setEvalError(err.message || 'Error submitting review');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    if (!rec) return '#888';
    if (rec.toUpperCase() === 'TERIMA') return '#10b981';
    if (rec.toUpperCase() === 'REVISI') return '#f59e0b';
    if (rec.toUpperCase() === 'TOLAK') return '#ef4444';
    return '#888';
  };

  const getRecommendationBg = (rec) => {
    if (!rec) return 'rgba(136,136,136,.1)';
    if (rec.toUpperCase() === 'TERIMA') return 'rgba(16,185,129,.1)';
    if (rec.toUpperCase() === 'REVISI') return 'rgba(245,158,11,.1)';
    if (rec.toUpperCase() === 'TOLAK') return 'rgba(239,68,68,.1)';
    return 'rgba(136,136,136,.1)';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2>{proposal.title}</h2>
            <p>{proposal.user?.name || 'Unknown'} • {new Date(proposal.createdAt).toLocaleDateString()}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${evalTab === 'preview' ? 'active' : ''}`}
            onClick={() => setEvalTab('preview')}
          >
            Preview
          </button>
          <button
            className={`modal-tab ${evalTab === 'summary' ? 'active' : ''}`}
            onClick={() => setEvalTab('summary')}
            disabled={!evalSummary}
          >
            Summary
          </button>
          <button
            className={`modal-tab ${evalTab === 'evaluate' ? 'active' : ''}`}
            onClick={() => setEvalTab('evaluate')}
            disabled={!evalResult}
          >
            Evaluation
          </button>
          <button
            className={`modal-tab ${evalTab === 'review' ? 'active' : ''}`}
            onClick={() => setEvalTab('review')}
          >
            Final Review
          </button>
        </div>

        {evalError && (
          <div className="modal-error">
            <strong>Error:</strong> {evalError}
          </div>
        )}

        <div className="modal-content">
          {/* Preview Tab */}
          {evalTab === 'preview' && (
            <div className="tab-content">
              <div className="proposal-info">
                <h3>Proposal Details</h3>
                <div className="info-row">
                  <label>Title:</label>
                  <span>{proposal.title}</span>
                </div>
                <div className="info-row">
                  <label>Category:</label>
                  <span>{proposal.category}</span>
                </div>
                <div className="info-row">
                  <label>Student:</label>
                  <span>{proposal.user?.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Description:</label>
                  <span>{proposal.description}</span>
                </div>
                <div className="info-row">
                  <label>Status:</label>
                  <span style={{ color: proposal.status === 'pending' ? '#ff9800' : proposal.status === 'approved' ? '#4CAF50' : '#f44336' }}>
                    {proposal.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="button-group">
                <button
                  className="action-btn summary-btn"
                  onClick={handleGenerateSummary}
                  disabled={evalLoading || !proposal.filePath}
                >
                  {evalLoading ? 'Processing...' : 'Generate Summary'}
                </button>
                <button
                  className="action-btn evaluate-btn"
                  onClick={handleEvaluate}
                  disabled={evalLoading || !proposal.filePath}
                >
                  {evalLoading ? 'Processing...' : 'AI Evaluate'}
                </button>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {evalTab === 'summary' && evalSummary && (
            <div className="tab-content">
              <h3>AI Summary</h3>
              <div className="summary-box">
                <p>{evalSummary.summary}</p>
              </div>
              <div className="button-group">
                <button
                  className="action-btn evaluate-btn"
                  onClick={handleEvaluate}
                  disabled={evalLoading}
                >
                  {evalLoading ? 'Processing...' : 'Proceed to Full Evaluation'}
                </button>
              </div>
            </div>
          )}

          {/* Evaluation Tab */}
          {evalTab === 'evaluate' && evalResult && (
            <div className="tab-content">
              <h3>AI Evaluation Results</h3>

              {evalResult.evaluation && (
                <div className="evaluation-results">
                  {/* Recommendation */}
                  <div className="eval-recommendation"
                    style={{
                      borderColor: getRecommendationColor(evalResult.evaluation.recommendation),
                      backgroundColor: getRecommendationBg(evalResult.evaluation.recommendation)
                    }}>
                    <div className="rec-label">Recommendation</div>
                    <div className="rec-value"
                      style={{ color: getRecommendationColor(evalResult.evaluation.recommendation) }}>
                      {evalResult.evaluation.recommendation?.toUpperCase() || 'N/A'}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="score-section">
                    <div className="score-label">Overall Score</div>
                    <div className="score-value">{evalResult.evaluation.total_score || 0}/75</div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${Math.min((evalResult.evaluation.total_score || 0) / 75 * 100, 100)}%`,
                          backgroundColor: getRecommendationColor(evalResult.evaluation.recommendation)
                        }}
                      />
                    </div>
                  </div>

                  {/* Scores */}
                  {evalResult.evaluation?.scores && (
                    <div className="scores-grid">
                      <h4>Parameter Scores</h4>
                      {evalResult.evaluation.scores.map((score, idx) => (
                        <div key={idx} className="score-item">
                          <div className="score-name">{score.parameter}</div>
                          <div className="score-bars">
                            <div className="score-bar-bg">
                              <div
                                className="score-bar-fg"
                                style={{ width: `${(score.score / 5) * 100}%` }}
                              />
                            </div>
                            <div className="score-number">{score.score.toFixed(1)}/5</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="feedback-section">
                    {evalResult.evaluation?.strengths && evalResult.evaluation.strengths.length > 0 && (
                      <div className="feedback-box strengths">
                        <h4>✓ Strengths</h4>
                        <ul>
                          {evalResult.evaluation.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evalResult.evaluation?.weaknesses && evalResult.evaluation.weaknesses.length > 0 && (
                      <div className="feedback-box weaknesses">
                        <h4>! Weaknesses</h4>
                        <ul>
                          {evalResult.evaluation.weaknesses.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final Review Tab */}
          {evalTab === 'review' && (
            <div className="tab-content">
              <h3>Final Review</h3>
              <div className="review-form">
                <div className="form-group">
                  <label>Status:</label>
                  <div className="status-buttons">
                    {['pending', 'approved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${reviewStatus === status ? 'active' : ''}`}
                        onClick={() => setReviewStatus(status)}
                        style={reviewStatus === status ? {
                          background: status === 'approved' ? '#4CAF50' : status === 'rejected' ? '#f44336' : '#ff9800',
                          color: '#fff'
                        } : {}}
                      >
                        {status.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Comments:</label>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Add your review comments here..."
                    rows={6}
                  />
                </div>

                <div className="button-group">
                  <button
                    className="action-btn submit-btn"
                    onClick={handleSubmitReview}
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    className="action-btn cancel-btn"
                    onClick={onClose}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-container {
            background: linear-gradient(180deg, rgba(28,35,68,.95), rgba(11,15,31,.98));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(20px);
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 24px 28px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .modal-header h2 {
            margin: 0 0 6px 0;
            font-size: 20px;
            color: #fff;
          }

          .modal-header p {
            margin: 0;
            font-size: 13px;
            color: #97a2b8;
          }

          .close-btn {
            background: none;
            border: none;
            color: #97a2b8;
            font-size: 24px;
            cursor: pointer;
            transition: color 0.2s;
          }

          .close-btn:hover {
            color: #fff;
          }

          .modal-tabs {
            display: flex;
            gap: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0 28px;
            background: rgba(0, 0, 0, 0.2);
          }

          .modal-tab {
            padding: 12px 16px;
            background: none;
            border: none;
            color: #97a2b8;
            font-weight: 600;
            font-size: 12.5px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.25s;
            font-family: inherit;
          }

          .modal-tab:hover:not(:disabled) {
            color: #e6e9f5;
          }

          .modal-tab.active {
            color: #6ee7f9;
            border-bottom-color: #6ee7f9;
          }

          .modal-tab:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .modal-error {
            margin: 16px 28px 0;
            padding: 12px 14px;
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid rgba(244, 67, 54, 0.3);
            border-radius: 8px;
            color: #ff7675;
            font-size: 13px;
          }

          .modal-content {
            overflow-y: auto;
            flex: 1;
            padding: 24px 28px;
          }

          .tab-content {
            display: grid;
            gap: 20px;
          }

          .proposal-info {
            display: grid;
            gap: 12px;
          }

          .proposal-info h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #fff;
          }

          .info-row {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 12px;
            align-items: start;
            padding: 12px;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 8px;
          }

          .info-row label {
            font-weight: 600;
            color: #6ee7f9;
            font-size: 13px;
          }

          .info-row span {
            color: #e6e9f5;
            font-size: 13px;
            line-height: 1.4;
          }

          .summary-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            color: #dce6f3;
            font-size: 13.5px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .evaluation-results {
            display: grid;
            gap: 16px;
          }

          .eval-recommendation {
            padding: 16px;
            border-radius: 12px;
            border: 2px solid;
            background: rgba(255, 255, 255, 0.05);
            display: grid;
            gap: 6px;
            justify-items: center;
          }

          .rec-label {
            font-size: 12px;
            color: #97a2b8;
            font-weight: 600;
          }

          .rec-value {
            font-size: 18px;
            font-weight: 800;
          }

          .score-section {
            display: grid;
            gap: 10px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }

          .score-label {
            font-size: 13px;
            font-weight: 600;
            color: #e6e9f5;
          }

          .score-value {
            font-size: 20px;
            font-weight: 800;
            color: #6ee7f9;
          }

          .score-bar {
            width: 100%;
            height: 12px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.12);
            overflow: hidden;
          }

          .score-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.5s ease;
          }

          .scores-grid {
            display: grid;
            gap: 10px;
          }

          .scores-grid h4 {
            margin: 0;
            font-size: 13px;
            font-weight: 600;
            color: #e6e9f5;
          }

          .score-item {
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            display: grid;
            gap: 8px;
          }

          .score-name {
            font-size: 12px;
            font-weight: 600;
            color: #dce6f3;
          }

          .score-bars {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .score-bar-bg {
            flex: 1;
            height: 8px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.12);
            overflow: hidden;
          }

          .score-bar-fg {
            height: 100%;
            background: linear-gradient(90deg, #6ee7f9, #8b5cf6);
            border-radius: 4px;
          }

          .score-number {
            font-size: 11px;
            color: #97a2b8;
            font-weight: 600;
            min-width: 40px;
            text-align: right;
          }

          .feedback-section {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .feedback-box {
            padding: 12px;
            border-radius: 10px;
            border: 1px solid;
            display: grid;
            gap: 8px;
          }

          .feedback-box h4 {
            margin: 0;
            font-size: 12px;
            font-weight: 700;
          }

          .feedback-box ul {
            margin: 0;
            padding-left: 16px;
            display: grid;
            gap: 4px;
          }

          .feedback-box li {
            font-size: 12px;
            line-height: 1.4;
          }

          .strengths {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
            color: #a7f3d0;
          }

          .strengths h4 {
            color: #6ee7b5;
          }

          .weaknesses {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.3);
            color: #fed7aa;
          }

          .weaknesses h4 {
            color: #fbbf24;
          }

          .review-form {
            display: grid;
            gap: 16px;
          }

          .form-group {
            display: grid;
            gap: 8px;
          }

          .form-group label {
            font-weight: 600;
            color: #e6e9f5;
            font-size: 13px;
          }

          .status-buttons {
            display: flex;
            gap: 8px;
          }

          .status-btn {
            flex: 1;
            padding: 10px 12px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: #e6e9f5;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          }

          .status-btn:hover {
            border-color: rgba(255, 255, 255, 0.3);
          }

          .status-btn.active {
            color: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .form-group textarea {
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: #e6e9f5;
            font-family: inherit;
            font-size: 13px;
            resize: vertical;
          }

          .form-group textarea::placeholder {
            color: #97a2b8;
          }

          .button-group {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }

          .action-btn {
            flex: 1;
            padding: 10px 14px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          }

          .summary-btn {
            background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
            color: #0b0f1f;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }

          .summary-btn:not(:disabled):hover {
            filter: brightness(1.05);
            box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
          }

          .evaluate-btn {
            background: linear-gradient(135deg, #10b981, #06b6d4);
            color: #fff;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .evaluate-btn:not(:disabled):hover {
            filter: brightness(1.05);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
          }

          .submit-btn {
            background: linear-gradient(135deg, #10b981, #06b6d4);
            color: #fff;
          }

          .cancel-btn {
            background: rgba(255, 255, 255, 0.1);
            color: #e6e9f5;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .action-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 640px) {
            .modal-container {
              max-width: 95vw;
              max-height: 95vh;
            }

            .info-row {
              grid-template-columns: 1fr;
            }

            .feedback-section {
              grid-template-columns: 1fr;
            }

            .button-group {
              flex-direction: column;
            }

            .action-btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
