import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { proposalEvaluationAPI } from '../services/api';
import ProposalSubmitModal from '../components/ProposalSubmitModal';
import ProposalStatusCard from '../components/ProposalStatusCard';

export default function Home() {
  // Evaluator states
  const [evalFile, setEvalFile] = useState(null);
  const [evalTab, setEvalTab] = useState('upload'); // 'upload', 'summary', 'evaluate'
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalSummary, setEvalSummary] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState('');
  
  // Proposal submission modal state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  
  // User & auth states
  const [user, setUser] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate(); // init navigator

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // sebelumnya: navigate('/login', { replace: true });
      // sekarang: cukup setFetching false agar Home tampil untuk user belum login
      setFetching(false);
      return;
    }
    const envBase = import.meta.env.VITE_API_URL?.trim();
    const base = (envBase && envBase !== '') ? envBase.replace(/\/+$/,'') : 'http://localhost:3000';
    (async () => {
      try {
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
        const json = await res.json().catch(()=>({}));
        if (!res.ok || !json.success) {
          setFetchError(json.error || 'Failed to load user.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('sikgo_user');
          // tidak redirect, tetap di Home
          return;
        }
        setUser(json.data);
        localStorage.setItem('sikgo_user', JSON.stringify({
          id: json.data._id,
          email: json.data.email,
          name: json.data.name,
          role: json.data.role,
          fullName: json.data.name
        }));
      } catch {
        setFetchError('Network error while fetching user.');
      } finally {
        setFetching(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    // trigger animation after first paint
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sikgo_user');
    navigate('/login', { replace: true });
  };

  const handleProposalSuccess = (proposal) => {
    // Handle successful proposal submission
    console.log('Proposal submitted successfully:', proposal);
    // You can add additional logic here like showing a notification
  };

  // Evaluator handlers
  const handleEvalFile = (f) => {
    if (!f) return;
    setEvalFile(f);
    setEvalError('');
    setEvalSummary(null);
    setEvalResult(null);
    setEvalTab('upload');
  };

  const onEvalChangeFile = (e) => handleEvalFile(e.target.files?.[0]);
  
  const onEvalDrop = (e) => {
    e.preventDefault();
    handleEvalFile(e.dataTransfer.files?.[0]);
  };

  const handleGenerateSummary = async () => {
    if (!evalFile) return;
    setEvalLoading(true);
    setEvalError('');
    try {
      const res = await proposalEvaluationAPI.generateSummary(evalFile);
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
    if (!evalFile) return;
    setEvalLoading(true);
    setEvalError('');
    try {
      const res = await proposalEvaluationAPI.evaluateProposal(evalFile);
      if (res.success) {
        setEvalResult(res.data);
        setEvalTab('evaluate');
      } else {
        setEvalError(res.error || 'Failed to evaluate proposal');
      }
    } catch (err) {
      setEvalError(err.message || 'Error evaluating proposal');
    } finally {
      setEvalLoading(false);
    }
  };

  const resetEvaluation = () => {
    setEvalFile(null);
    setEvalTab('upload');
    setEvalSummary(null);
    setEvalResult(null);
    setEvalError('');
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

  if (fetching) {
    return <div style={{padding:40,color:'#e6efff',fontFamily:'sans-serif'}}>Loading user...</div>;
  }
  // ubah kondisi error: jika tidak login (user null, !authToken) abaikan fetchError
  const tokenPresent = !!localStorage.getItem('authToken');
  if (fetchError && tokenPresent && !user) {
    return <div style={{padding:40,color:'#f87171',fontFamily:'sans-serif'}}>Error: {fetchError}</div>;
  }

  // Determine display name safely (avoid accessing properties on null)
  const displayName = user
    ? (user.fullName
        || user.name
        || (user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'User'))
    : 'Guest';

  return (
    <div className={`home-root ${mounted ? 'animated' : ''}`}>
      <nav className="topbar fixed-top">
        <div className="logo">
          <img src="/Icon.svg" alt="Logo" className="logo-icon" />
          <span className="logo-text">SIK-GO</span>
        </div>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
          {user && <Link to="/bookings">Bookings</Link>}
          {user && <Link to="/proposals">Proposals</Link>}
          {!user && <Link to="/login" className="login-btn">Log In</Link>}
          {user && (
            <>
              <span className="welcome">Welcome back, {displayName}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <h1>
          {user ? (
            <>Welcome back, <span className="nowrap">{displayName}</span></>
          ) : (
            <>Welcome to <span className="nowrap">SIK‑GO</span></>
          )}
        </h1>
        <p>A platform to manage room reservations and FT UI information seamlessly.</p>
        {user && (
          <button 
            className="hero-submit-btn"
            onClick={() => setIsProposalModalOpen(true)}
          >
            Submit Your Proposal
          </button>
        )}
      </header>

      {/* Proposal Evaluator Section */}
      <section className="proposal-evaluator">
        <div className="evaluator-box">
          <div className="evaluator-head">
            <h2>AI Proposal Evaluator</h2>
            <p>Upload your proposal for AI-powered analysis and FTUI-standard evaluation.</p>
          </div>

          {/* Tabs */}
          <div className="eval-tabs">
            <button 
              className={`eval-tab ${evalTab === 'upload' ? 'active' : ''}`}
              onClick={() => setEvalTab('upload')}
            >
              Upload
            </button>
            <button 
              className={`eval-tab ${evalTab === 'summary' ? 'active' : ''}`}
              onClick={() => setEvalTab('summary')}
              disabled={!evalSummary}
            >
              Summary
            </button>
            <button 
              className={`eval-tab ${evalTab === 'evaluate' ? 'active' : ''}`}
              onClick={() => setEvalTab('evaluate')}
              disabled={!evalResult}
            >
              Evaluation
            </button>
          </div>

          {/* Upload Tab */}
          {evalTab === 'upload' && (
            <div className="eval-tab-content">
              <label 
                className="eval-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
                onDrop={onEvalDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx,.xls,.xlsx"
                  onChange={onEvalChangeFile}
                  hidden
                />
                {!evalFile ? (
                  <div className="eval-placeholder">
                    <div className="eval-icon">📄</div>
                    <strong>Drag & Drop your proposal</strong>
                    <span>or click to select file</span>
                    <em>Formats: PDF, TXT, MD, DOC, DOCX, XLS, XLSX</em>
                  </div>
                ) : (
                  <div className="eval-file-preview">
                    <div className="eval-file-icon">
                      {evalFile.type.startsWith('image/') ? '🖼️' : '📄'}
                    </div>
                    <div className="eval-file-meta">
                      <div className="eval-fname">{evalFile.name}</div>
                      <div className="eval-fsize">{(evalFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <div className="eval-file-btns">
                      <button
                        type="button"
                        className="eval-action-btn summary-btn"
                        onClick={handleGenerateSummary}
                        disabled={evalLoading}
                      >
                        {evalLoading ? 'Processing...' : 'Generate Summary'}
                      </button>
                      <button
                        type="button"
                        className="eval-action-btn evaluate-btn"
                        onClick={handleEvaluate}
                        disabled={evalLoading}
                      >
                        {evalLoading ? 'Processing...' : 'Evaluate'}
                      </button>
                      <button
                        type="button"
                        className="eval-action-btn reset-eval-btn"
                        onClick={resetEvaluation}
                        disabled={evalLoading}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </label>

              {evalError && (
                <div className="eval-error">
                  <strong>Error:</strong> {evalError}
                </div>
              )}
            </div>
          )}

          {/* Summary Tab */}
          {evalTab === 'summary' && evalSummary && (
            <div className="eval-tab-content">
              <div className="eval-summary-box">
                <div className="eval-summary-header">
                  <h3>Summary</h3>
                  <div className="eval-file-info">
                    <span>{evalSummary.filename}</span>
                    <span className="sep">•</span>
                    <span>{evalSummary.textLength || 0} chars</span>
                  </div>
                </div>
                <div className="eval-summary-text">
                  {evalSummary.summary}
                </div>
                <div className="eval-summary-actions">
                  <button
                    className="eval-action-btn evaluate-btn"
                    onClick={handleEvaluate}
                    disabled={evalLoading}
                  >
                    {evalLoading ? 'Processing...' : 'Proceed to Evaluation'}
                  </button>
                  <button
                    className="eval-action-btn reset-eval-btn"
                    onClick={resetEvaluation}
                    disabled={evalLoading}
                  >
                    Upload New File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Tab */}
          {evalTab === 'evaluate' && evalResult && (
            <div className="eval-tab-content">
              <div className="eval-results-box">
                <div className="eval-results-header">
                  <h3>Evaluation Results</h3>
                  <div className="eval-file-info">
                    <span>{evalResult.filename}</span>
                  </div>
                </div>

                {/* Recommendation Badge */}
                {evalResult.evaluation && (
                  <div className="eval-recommendation-section">
                    <div 
                      className="eval-recommendation"
                      style={{
                        borderColor: getRecommendationColor(evalResult.evaluation.recommendation),
                        backgroundColor: getRecommendationBg(evalResult.evaluation.recommendation)
                      }}
                    >
                      <div className="eval-rec-label">Recommendation</div>
                      <div 
                        className="eval-rec-value"
                        style={{ color: getRecommendationColor(evalResult.evaluation.recommendation) }}
                      >
                        {evalResult.evaluation.recommendation?.toUpperCase() || 'N/A'}
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="eval-score-section">
                      <div className="eval-score-label">Overall Score</div>
                      <div className="eval-score-display">
                        <div className="eval-score-value">
                          {evalResult.evaluation.total_score || 0}
                          <span className="eval-score-max">/75</span>
                        </div>
                        <div className="eval-score-bar">
                          <div 
                            className="eval-score-fill"
                            style={{
                              width: `${Math.min((evalResult.evaluation.total_score || 0) / 75 * 100, 100)}%`,
                              backgroundColor: getRecommendationColor(evalResult.evaluation.recommendation)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scores Grid */}
                {evalResult.evaluation?.scores && (
                  <div className="eval-scores-grid">
                    <h4>Parameter Scores</h4>
                    <div className="eval-scores-list">
                      {evalResult.evaluation.scores.map((score, idx) => (
                        <div key={idx} className="eval-score-item">
                          <div className="eval-score-name">{score.parameter}</div>
                          <div className="eval-score-bars">
                            <div className="eval-score-bar-bg">
                              <div 
                                className="eval-score-bar-fg"
                                style={{
                                  width: `${(score.score / 5) * 100}%`
                                }}
                              />
                            </div>
                            <div className="eval-score-number">{score.score.toFixed(1)}/5</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="eval-feedback-section">
                  {evalResult.evaluation?.strengths && evalResult.evaluation.strengths.length > 0 && (
                    <div className="eval-feedback-box strengths">
                      <h4>✓ Strengths</h4>
                      <ul>
                        {evalResult.evaluation.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evalResult.evaluation?.weaknesses && evalResult.evaluation.weaknesses.length > 0 && (
                    <div className="eval-feedback-box weaknesses">
                      <h4>! Weaknesses</h4>
                      <ul>
                        {evalResult.evaluation.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="eval-results-actions">
                  <button
                    className="eval-action-btn reset-eval-btn"
                    onClick={resetEvaluation}
                  >
                    Evaluate Another Proposal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About Us (static) */}
      <section className="about-us">
        <div className="about-box">
          <div className="about-head">
            <span className="badge">About</span>
            <h2>About SIK‑GO</h2>
          </div>
          <p className="about-lead">
            SIK‑GO streamlines room reservations and faculty information with a focus on clarity,
            speed, accessibility, and security for every user. The platform also leverages AI to
            scan documents (OCR), classify submissions, and extract key information such as names,
            IDs, dates, and references to minimize manual entry and accelerate approvals. Integrate
            your preferred AI provider to activate full intelligent processing within the scan flow.
          </p>
          <div className="about-grid">
            <div className="about-item">
              <div className="a-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.7 4.1 2.2 7L12 16l-6.5 4.1 2.2-7L2 9h7z" fill="currentColor"/></svg>
              </div>
              <h3>Mission</h3>
              <p>Efficient workflows with transparent facility status and clear approvals.</p>
            </div>
            <div className="about-item">
              <div className="a-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h3>Performance</h3>
              <p>Snappy experience with scalable architecture and resilient services.</p>
            </div>
            <div className="about-item">
              <div className="a-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.6 9.7-8 10-4.4-.3-8-5-8-10V7l8-4z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </div>
              <h3>Security</h3>
              <p>Modern auth, role-based access, and best practices by default.</p>
            </div>
            <div className="about-item">
              <div className="a-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M4 12h6l3 3h7M4 12l6-6h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              </div>
              <h3>Roadmap</h3>
              <p>Analytics, advanced search, and automated approval pipelines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section (full width, polished) */}
      <section className="contact-block">
        <div className="contact-inner">
          <h2>Contact</h2>
          <div className="contact-grid">
            <div>
              <div className="c-head">
                <span className="c-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 2l9 7-9 7-9-7 9-7zM3 18l9 6 9-6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                </span>
                <h3>Address</h3>
              </div>
              <p>Fakultas Teknik Universitas Indonesia<br/>Depok, West Java 16424</p>
            </div>
            <div>
              <div className="c-head">
                <span className="c-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 5l9 7 9-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                </span>
                <h3>Email</h3>
              </div>
              <p><a className="contact-link" href="mailto:contact@sikgo.com">contact@sikgo.com</a></p>
            </div>
            <div>
              <div className="c-head">
                <span className="c-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2 11 11 0 003.4 1v3a2 2 0 01-2.2 2 18 18 0 01-16-16A2 2 0 015 3h3a11 11 0 011 3.4 1 1 0 01-.2 1.1l-2.2 2.3z" fill="currentColor"/></svg>
                </span>
                <h3>Phone</h3>
              </div>
              <p><a className="contact-link" href="tel:+621234567890">+62 123 456 7890</a></p>
            </div>
            <div>
              <div className="c-head">
                <span className="c-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-9-9v9h9z" fill="currentColor"/></svg>
                </span>
                <h3>Support Hours</h3>
              </div>
              <p>Mon–Fri 08:00–16:00 WIB</p>
            </div>
          </div>
          <div className="contact-copy">@ 2025 SIK-GO</div>
        </div>
      </section>

      {/* Proposal Submit Modal */}
      <ProposalSubmitModal 
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSuccess={handleProposalSuccess}
      />

      <style>{`
        :root {
          --grad-main: radial-gradient(1100px 720px at 15% 18%, #1c2344 0%, rgba(28,35,68,.75) 40%, rgba(11,15,31,.95) 68%, #06070f 100%);
          --grad-accent-purple: radial-gradient(800px 520px at 86% 12%, rgba(67,27,87,.55) 0%, rgba(67,27,87,0) 60%);
          --grad-accent-deep: radial-gradient(680px 420px at 20% 88%, rgba(50,22,75,.45) 0%, rgba(50,22,75,0) 60%);
          --grad-link: linear-gradient(90deg,#6ee7f9,#8b5cf6);
          --panel-bg: linear-gradient(170deg,rgba(255,255,255,.07),rgba(255,255,255,.02));
          --radius-lg:20px;
          --color-text:#cfd6e4;
          --color-text-dim:#97a2b8;
          --color-white:#ffffff;
        }

        html,body,#root,.home-root { max-width:100vw; overflow-x:hidden; }
        html,body,#root { margin:0; padding:0; }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          background: transparent;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(110, 231, 249, 0.4);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(110, 231, 249, 0.6);
        }

        body {
          background: radial-gradient(1400px 900px at 10% 10%, #1a1f42 0%, #0f1429 45%, #0b0e1e 70%, #060712 100%);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue";
          -webkit-font-smoothing: antialiased;
          color:#e6e9f5;
          overscroll-behavior-x:none;
        }

        .home-root { 
          padding-top:86px;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .home-root.animated {
          opacity: 1;
        }
        
        .home-root::before,
        .home-root::after {
          content:""; 
          position:fixed; 
          inset:-20%;
          pointer-events:none; 
          width:800px; 
          height:800px;
          border-radius:50%; 
          filter:blur(70px); 
          opacity:.35; 
          z-index:-1;
          transform: translateZ(0);
        }
        .home-root::before { 
          top:-50px; 
          right:-200px; 
          background:radial-gradient(circle at 20% 30%, #6ee7f955, transparent 50%); 
        }
        .home-root::after { 
          bottom:-300px; 
          left:-100px; 
          background:radial-gradient(circle at 80% 20%, #8b5cf655, transparent 50%); 
        }
        .topbar,.hero,.doc-scan,.about-us,.contact-block { position:relative; z-index:1; }

        /* Topbar & navigation */
        .topbar {
          position:fixed; top:0; left:0; right:0;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 34px; backdrop-filter:blur(12px);
          background:rgba(0, 0, 0, 0.08);
        }
        .logo { display:flex; align-items:center; gap:12px; }
        .logo-icon { width:36px; height:36px; }
        .logo-text { font-weight:700; font-size:18px; letter-spacing:.5px; background:var(--grad-link); -webkit-background-clip:text; color:transparent; }
        .links { display:flex; align-items:center; gap:24px; }
        .links a {
          font-size:13.5px; font-weight:600; letter-spacing:.25px;
          color:var(--color-text); text-decoration:none; position:relative; padding:4px 4px;
          transition:color .25s;
        }
        .links a::after {
          content:""; position:absolute; left:10%; right:10%; bottom:0; height:2px;
          background:var(--grad-link); border-radius:2px; transform:scaleX(0); transform-origin:left;
          transition:transform .35s cubic-bezier(.16,.72,.25,1);
        }
        .links a:hover,.links a:focus-visible { color:var(--color-white); }
        .links a:hover::after,.links a:focus-visible::after { transform:scaleX(1); }
        .login-btn {
          font-size:13.5px; font-weight:600; letter-spacing:.3px;
          display:inline-flex; align-items:center; padding:8px 16px; border-radius:999px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          box-shadow:0 6px 20px -4px rgba(139,92,246,.45); text-decoration:none;
          transition:transform .15s, box-shadow .3s, filter .25s;
        }
        .login-btn:hover { transform:translateY(-2px); box-shadow:0 10px 26px -4px rgba(139,92,246,.55); filter:brightness(1.05); }
        .login-btn:focus-visible { outline:2px solid #6ee7f9; outline-offset:2px; }
        .welcome { font-size:13px; font-weight:500; letter-spacing:.3px; color:#e6efff; }
        .logout-btn {
          padding:8px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.16);
          background:rgba(255,255,255,.06); color:#e8eef8; font-weight:600; cursor:pointer;
          transition:background .25s;
        }
        .logout-btn:hover { background:rgba(255,255,255,.12); }

        /* Hero */
        .hero {
          padding:80px 34px 40px; max-width:680px; margin:0 auto;
          display:grid; gap:22px; text-align:center; justify-items:center;
        }
        .hero h1 {
          margin:0; font-size:clamp(2.3rem,5vw,3.2rem); line-height:1.25;
          background:linear-gradient(90deg,#fff,#b5c6ff); -webkit-background-clip:text; color:transparent;
        }
        .hero p { margin:0; font-size:17px; color:#b4bccf; line-height:1.5; }
        .hero-submit-btn {
          margin-top:12px; padding:12px 28px; border-radius:999px;
          background:linear-gradient(135deg,#10b981,#06b6d4); color:white; border:none;
          font-weight:600; font-size:15px; letter-spacing:.3px; cursor:pointer;
          box-shadow:0 8px 24px -6px rgba(16,185,129,.4); transition:all .3s;
        }
        .hero-submit-btn:hover {
          transform:translateY(-2px); box-shadow:0 12px 32px -6px rgba(16,185,129,.5); filter:brightness(1.05);
        }
        .hero-submit-btn:active { transform:translateY(0); }

        /* Proposal Evaluator */
        .about-us { padding:10px 34px 40px; margin:120px auto 110px; }
        .about-box {
          max-width:1080px; margin:0 auto; display:grid; gap:26px;
          padding:34px 30px 40px; border-radius:22px;
          background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.06));
          border:1px solid rgba(255,255,255,.18); backdrop-filter:blur(12px) saturate(130%);
          box-shadow:0 22px 60px -22px rgba(0,0,0,.55);
        }
        .about-head { display:flex; align-items:center; gap:12px; }
        .about-head .badge {
          font-size:11px; letter-spacing:.6px; text-transform:uppercase;
          padding:6px 10px; border-radius:999px; color:#0b0f1f; font-weight:700;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6);
        }
        .about-head h2 { margin:0; font-size:22px; font-weight:800; letter-spacing:.4px; color:#fff; }
        .about-lead { margin:0; font-size:14.5px; line-height:1.6; color:#dce6f3; }
        .about-grid { display:grid; gap:18px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); }
        .about-item {
          display:grid; gap:10px; padding:16px 16px 18px; border-radius:16px;
          background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18);
          box-shadow:0 14px 34px -14px rgba(0,0,0,.55); transition:.25s;
        }
        .about-item:hover { transform:translateY(-4px); background:rgba(255,255,255,.18); border-color:rgba(255,255,255,.26); }
        .about-item h3 { margin:0; font-size:15px; font-weight:700; color:#fff; letter-spacing:.3px; }
        .about-item p { margin:0; font-size:13px; line-height:1.55; color:#cfe0ee; }
        .a-ico {
          width:34px; height:34px; display:grid; place-items:center; border-radius:10px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          box-shadow:0 8px 22px -10px rgba(139,92,246,.55);
        }

        /* Contact */
        .contact-block {
          background:#06070f; border-top:1px solid #0e111c; border-bottom:1px solid #0e111c;
          padding:42px 40px 48px; box-shadow:0 14px 40px -12px rgba(0,0,0,.65);
        }
        .contact-inner { max-width:1200px; margin:0 auto; display:grid; gap:34px; }
        .contact-inner h2 { margin:0; font-size:24px; font-weight:800; letter-spacing:.45px; color:#fff; }
        .contact-grid { display:grid; grid-template-columns:repeat(4,minmax(200px,1fr)); gap:32px; }
        .contact-grid > div:not(:first-child) { border-left:1px solid #121724; padding-left:22px; }
        .c-head { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
        .c-ico {
          width:32px; height:32px; display:grid; place-items:center; border-radius:8px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          box-shadow:0 8px 22px -10px rgba(139,92,246,.55);
        }
        .contact-grid h3 { margin:0; font-size:15px; font-weight:700; letter-spacing:.35px; color:#fff; }
        .contact-grid p { margin:0; font-size:14px; line-height:1.6; color:#d0d9e4; }
        .contact-link { color:#fff; font-weight:600; text-decoration:none; transition:.25s; }
        .contact-link:hover { text-decoration:underline; color:#bfc7ff; }
        .contact-copy {
          margin-top:12px; padding-top:14px; border-top:1px solid #121724;
          font-size:12px; letter-spacing:.4px; color:#798494; text-align:center;
        }

        /* Proposal Evaluator */
        .proposal-evaluator { padding:10px 34px 70px; max-width:960px; margin:0 auto; width:100%; }
        .evaluator-box {
          display:grid; gap:22px; padding:28px 26px 30px; border-radius:var(--radius-lg);
          background:var(--panel-bg); border:1px solid rgba(255,255,255,.02); backdrop-filter:blur(10px);
        }
        .evaluator-head h2 {
          margin:0; font-size:20px; background:linear-gradient(90deg,#ffffff,#b5c6ff);
          -webkit-background-clip:text; color:transparent;
        }
        .evaluator-head p { margin:6px 0 0; font-size:13px; color:var(--color-text-dim); letter-spacing:.2px; }

        /* Tabs */
        .eval-tabs {
          display:flex; gap:8px; border-bottom:1px solid rgba(255,255,255,.12);
          padding-bottom:14px; margin-bottom:12px;
        }
        .eval-tab {
          padding:8px 14px; font-size:12px; font-weight:600; letter-spacing:.3px;
          border:none; background:transparent; color:#97a2b8; cursor:pointer;
          border-bottom:2px solid transparent; transition:.25s;
          position:relative; bottom:-2px;
        }
        .eval-tab:hover:not(:disabled) { color:#e6e9f5; }
        .eval-tab.active { color:#6ee7f9; border-bottom-color:#6ee7f9; }
        .eval-tab:disabled { opacity:.5; cursor:not-allowed; }

        .eval-tab-content { display:grid; gap:16px; }

        /* Dropzone */
        .eval-dropzone {
          position:relative; min-height:200px; display:grid; place-items:center;
          border:1.5px dashed rgba(255,255,255,.28); border-radius:18px; padding:20px;
          background:rgba(255,255,255,.04); cursor:pointer; color:#c7d0df; transition:.3s;
        }
        .eval-dropzone:hover { border-color:rgba(139,92,246,.6); background:rgba(255,255,255,.07); }
        .eval-placeholder { display:grid; gap:8px; text-align:center; }
        .eval-icon { font-size:36px; }
        .eval-placeholder strong { font-size:14px; }
        .eval-placeholder span { font-size:12px; color:#a6b2c6; }
        .eval-placeholder em { font-size:11px; color:#8a95a8; font-style:normal; }

        .eval-file-preview { display:grid; grid-template-columns:80px 1fr auto; gap:16px; align-items:center; width:100%; }
        .eval-file-icon { font-size:32px; text-align:center; }
        .eval-file-meta { display:grid; gap:4px; }
        .eval-fname { font-size:14px; font-weight:600; color:#eef1f7; word-break:break-all; }
        .eval-fsize { font-size:12px; color:#93a0b4; }
        .eval-file-btns { display:flex; gap:8px; flex-wrap:wrap; }

        .eval-action-btn {
          padding:8px 12px; border:none; border-radius:8px; font-size:12px; font-weight:600;
          cursor:pointer; transition:.2s; letter-spacing:.2px;
        }
        .eval-action-btn:disabled { opacity:.6; cursor:not-allowed; }

        .summary-btn {
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          box-shadow:0 6px 16px -4px rgba(139,92,246,.4);
        }
        .summary-btn:hover:not(:disabled) { filter:brightness(1.05); box-shadow:0 8px 20px -4px rgba(139,92,246,.5); }

        .evaluate-btn {
          background:linear-gradient(135deg,#10b981,#06b6d4); color:#fff;
          box-shadow:0 6px 16px -4px rgba(16,185,129,.4);
        }
        .evaluate-btn:hover:not(:disabled) { filter:brightness(1.05); box-shadow:0 8px 20px -4px rgba(16,185,129,.5); }

        .reset-eval-btn {
          background:rgba(255,255,255,.08); color:#e6ecf5;
          border:1px solid rgba(255,255,255,.16);
        }
        .reset-eval-btn:hover:not(:disabled) { background:rgba(255,255,255,.14); }

        /* Error */
        .eval-error {
          padding:12px 14px; border-radius:12px; border-left:3px solid #ef4444;
          background:rgba(239,68,68,.1); color:#fca5a5; font-size:13px;
        }

        /* Summary Box */
        .eval-summary-box { display:grid; gap:18px; }
        .eval-summary-header { display:grid; gap:6px; }
        .eval-summary-header h3 { margin:0; font-size:16px; font-weight:600; color:#eef1f7; }
        .eval-file-info { font-size:12px; color:#97a2b8; }
        .eval-file-info .sep { margin:0 6px; }

        .eval-summary-text {
          padding:16px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12);
          border-radius:12px; line-height:1.6; color:#dce6f3; font-size:14px; white-space:pre-wrap;
          word-wrap:break-word;
        }

        .eval-summary-actions { display:flex; gap:10px; }

        /* Results Box */
        .eval-results-box { display:grid; gap:20px; }
        .eval-results-header { display:grid; gap:6px; }
        .eval-results-header h3 { margin:0; font-size:16px; font-weight:600; color:#eef1f7; }

        /* Recommendation & Score */
        .eval-recommendation-section { display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:center; }
        .eval-recommendation {
          padding:16px; border-radius:12px; border:2px solid;
          background:rgba(255,255,255,.05);
          display:grid; gap:6px; justify-items:center; min-width:140px;
        }
        .eval-rec-label { font-size:12px; color:#97a2b8; font-weight:600; letter-spacing:.2px; }
        .eval-rec-value { font-size:18px; font-weight:800; letter-spacing:.3px; }

        .eval-score-section { display:grid; gap:10px; }
        .eval-score-label { font-size:13px; font-weight:600; color:#e6e9f5; }
        .eval-score-display { display:grid; gap:8px; }
        .eval-score-value {
          font-size:28px; font-weight:800; color:#6ee7f9; letter-spacing:.5px;
        }
        .eval-score-max { font-size:14px; color:#97a2b8; font-weight:600; }
        .eval-score-bar {
          width:100%; height:12px; border-radius:6px; background:rgba(255,255,255,.12);
          overflow:hidden;
        }
        .eval-score-fill {
          height:100%; background:linear-gradient(90deg,#6ee7f9,#8b5cf6);
          border-radius:6px; transition:width .5s ease;
        }

        /* Scores Grid */
        .eval-scores-grid { display:grid; gap:12px; }
        .eval-scores-grid h4 { margin:0; font-size:14px; font-weight:600; color:#e6e9f5; }
        .eval-scores-list { display:grid; gap:10px; }
        .eval-score-item {
          padding:12px; border-radius:10px; background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.12); display:grid; gap:8px;
        }
        .eval-score-name { font-size:12px; font-weight:600; color:#dce6f3; }
        .eval-score-bars { display:flex; align-items:center; gap:8px; }
        .eval-score-bar-bg {
          flex:1; height:8px; border-radius:4px; background:rgba(255,255,255,.12);
          overflow:hidden;
        }
        .eval-score-bar-fg {
          height:100%; background:linear-gradient(90deg,#6ee7f9,#8b5cf6);
          border-radius:4px;
        }
        .eval-score-number { font-size:11px; color:#97a2b8; font-weight:600; min-width:40px; text-align:right; }

        /* Feedback */
        .eval-feedback-section { display:grid; gap:14px; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); }
        .eval-feedback-box {
          padding:14px; border-radius:10px; border:1px solid;
          display:grid; gap:10px;
        }
        .eval-feedback-box h4 { margin:0; font-size:13px; font-weight:700; }
        .eval-feedback-box ul { margin:0; padding-left:18px; display:grid; gap:6px; }
        .eval-feedback-box li { font-size:12px; line-height:1.5; }

        .strengths {
          background:rgba(16,185,129,.1); border-color:rgba(16,185,129,.3);
          color:#a7f3d0;
        }
        .strengths h4 { color:#6ee7b5; }

        .weaknesses {
          background:rgba(245,158,11,.1); border-color:rgba(245,158,11,.3);
          color:#fed7aa;
        }
        .weaknesses h4 { color:#fbbf24; }

        /* Results Actions */
        .eval-results-actions { display:flex; gap:10px; margin-top:10px; }

        /* Responsive */
        @media (max-width:960px){
          .contact-grid { grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:28px; }
          .contact-grid > div { border-left:none; padding-left:0; }
        }
        @media (max-width:640px){
          .about-box { padding:28px 22px 34px; }
          .about-us { margin:100px auto 90px; padding:10px 22px 34px; }
          .contact-block { padding:36px 22px 42px; }
          .links { gap:18px; }
          .links a { font-size:13px; padding:4px 2px; }
          .welcome { display:none; }
          .hero { padding:90px 22px 46px; }
          .eval-recommendation-section { grid-template-columns:1fr; }
          .eval-file-preview { grid-template-columns:60px 1fr; }
          .eval-file-btns { flex-direction:column; }
          .eval-action-btn { width:100%; }
        }
        @media (max-width:460px){
          .logo-text { display:none; }
          .links { gap:14px; }
        }

        /* Simple entrance animation */
        .home-root .hero,.home-root .proposal-evaluator,.home-root .about-us,.home-root .contact-block {
          opacity:0; transform:translateY(20px) scale(.97);
        }
        .home-root.animated .hero,
        .home-root.animated .proposal-evaluator,
        .home-root.animated .about-us,
        .home-root.animated .contact-block {
          opacity:1; transform:translateY(0) scale(1);
          transition:opacity .7s ease, transform .7s cubic-bezier(.16,.72,.25,1);
        }
        .home-root.animated .hero { transition-delay:.05s; }
        .home-root.animated .proposal-evaluator { transition-delay:.18s; }
        .home-root.animated .about-us { transition-delay:.28s; }
        .home-root.animated .contact-block { transition-delay:.38s; }
      `}</style>
    </div>
  );
}
