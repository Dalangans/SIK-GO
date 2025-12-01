import React, { useState } from 'react';
import { proposalAnalysisAPI } from '../services/api';
import '../styles/documentScanner.css';

const DocumentScanner = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // upload, result

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize((selectedFile.size / 1024).toFixed(1));
      setFileType(selectedFile.type);
      setError('');
    }
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
      setFileName(droppedFile.name);
      setFileSize((droppedFile.size / 1024).toFixed(1));
      setFileType(droppedFile.type);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError('');
    setActiveTab('result');

    try {
      // Show extraction simulation first
      setExtractionResult({
        status: 'processing',
        message: 'Extracting text and data from document...',
        name: fileName,
        type: fileType,
        size: `${fileSize} KB`
      });

      // Perform complete audit
      const response = await proposalAnalysisAPI.performCompleteAudit(
        file,
        fileName.replace(/\.[^/.]+$/, ''), // Remove extension from name as title
        'general',
        ''
      );

      // Update extraction result with success
      setExtractionResult({
        status: 'success',
        message: 'Extraction completed',
        name: fileName,
        type: fileType,
        size: `${fileSize} KB`,
        ocrText: 'OCR text will appear here after integrating your API.'
      });

      // Set analysis result
      setAnalysisResult(response.data);
    } catch (err) {
      setError(err.message || 'Error analyzing document');
      setExtractionResult({
        status: 'error',
        message: err.message || 'Failed to process document'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileName('');
    setFileSize('');
    setFileType('');
    setExtractionResult(null);
    setAnalysisResult(null);
    setError('');
    setActiveTab('upload');
  };

  const getFileIcon = () => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  return (
    <div className="document-scanner-container">
      <div className="scanner-header">
        <h1>📋 Scan / Upload Document</h1>
        <p>Upload image/PDF, AI extracts text & key data (simulation).</p>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="scanner-content">
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="file-preview">
                <div className="file-icon">{getFileIcon()}</div>
                <div className="file-info">
                  <div className="file-name">{fileName}</div>
                  <div className="file-details">{fileSize} KB</div>
                </div>
                <div className="file-actions">
                  <button 
                    className="btn btn-submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Submit'}
                  </button>
                  <button 
                    className="btn btn-reset"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📤</div>
                <div className="upload-text">
                  <p className="upload-title">Drop files here or click to select</p>
                  <p className="upload-subtitle">Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, MD</p>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Tab */}
      {activeTab === 'result' && extractionResult && (
        <div className="scanner-content">
          <div className="extraction-result">
            <h2>
              {extractionResult.status === 'success' && '✅ Extraction Result'}
              {extractionResult.status === 'error' && '❌ Extraction Failed'}
              {extractionResult.status === 'processing' && '⏳ Processing...'}
            </h2>

            <div className="result-details">
              <p><strong>Extraction Status:</strong> {extractionResult.message}</p>
              {extractionResult.name && (
                <>
                  <p><strong>Name:</strong> {extractionResult.name}</p>
                  <p><strong>Type:</strong> {extractionResult.type}</p>
                  <p><strong>Size:</strong> {extractionResult.size}</p>
                </>
              )}
            </div>

            {extractionResult.status === 'success' && (
              <>
                <div className="ocr-section">
                  <p className="ocr-label">OCR Text:</p>
                  <div className="ocr-text">
                    {extractionResult.ocrText || 'OCR text will appear here after integrating your API.'}
                  </div>
                </div>

                {analysisResult && (
                  <div className="analysis-section">
                    <h3>📊 AI Analysis Results</h3>
                    
                    {analysisResult.auditReport && (
                      <>
                        {/* Quality Score */}
                        {analysisResult.auditReport.analysis?.score && (
                          <div className="analysis-card">
                            <h4>Quality Score</h4>
                            <div className="score-display">
                              <div className="score-value">
                                {analysisResult.auditReport.analysis.score}/100
                              </div>
                              <div className="score-bar">
                                <div 
                                  className="score-fill"
                                  style={{ 
                                    width: `${analysisResult.auditReport.analysis.score}%`,
                                    backgroundColor: getScoreColor(analysisResult.auditReport.analysis.score)
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Structure & Clarity */}
                        {(analysisResult.auditReport.analysis?.structure || 
                          analysisResult.auditReport.analysis?.clarity) && (
                          <div className="analysis-card">
                            <h4>Document Quality</h4>
                            <div className="quality-items">
                              {analysisResult.auditReport.analysis.structure && (
                                <div className="quality-item">
                                  <span>Structure:</span>
                                  <span>{analysisResult.auditReport.analysis.structure}</span>
                                </div>
                              )}
                              {analysisResult.auditReport.analysis.clarity && (
                                <div className="quality-item">
                                  <span>Clarity:</span>
                                  <span>{analysisResult.auditReport.analysis.clarity}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Plagiarism Check */}
                        {analysisResult.auditReport.plagiarismCheck && (
                          <div className="analysis-card">
                            <h4>🔍 Plagiarism Check</h4>
                            <div className="plagiarism-info">
                              <p>
                                <strong>Risk Level:</strong>{' '}
                                <span className={`risk-${analysisResult.auditReport.plagiarismCheck.riskLevel?.toLowerCase()}`}>
                                  {analysisResult.auditReport.plagiarismCheck.riskLevel}
                                </span>
                              </p>
                              {analysisResult.auditReport.plagiarismCheck.originalPercentage && (
                                <p>
                                  <strong>Original Content:</strong> 
                                  {analysisResult.auditReport.plagiarismCheck.originalPercentage}%
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {analysisResult.auditReport.overallRecommendation && (
                          <div className="analysis-card recommendation-card">
                            <h4>📋 Overall Recommendation</h4>
                            <div className={`recommendation ${analysisResult.auditReport.overallRecommendation.status.toLowerCase()}`}>
                              <p>
                                <strong>Status:</strong> {analysisResult.auditReport.overallRecommendation.status}
                              </p>
                              <p>
                                <strong>Reason:</strong> {analysisResult.auditReport.overallRecommendation.reason}
                              </p>
                              <p>
                                <strong>Action:</strong> {analysisResult.auditReport.overallRecommendation.action}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Improvement Suggestions */}
                        {analysisResult.auditReport.suggestions?.priorityActions && (
                          <div className="analysis-card">
                            <h4>💡 Priority Actions</h4>
                            <ol className="suggestions-list">
                              {analysisResult.auditReport.suggestions.priorityActions.map((action, idx) => (
                                <li key={idx}>{action}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="result-actions">
              <button className="btn btn-primary" onClick={handleReset}>
                Upload Another Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FFC107';
  if (score >= 40) return '#FF9800';
  return '#F44336';
};

export default DocumentScanner;
