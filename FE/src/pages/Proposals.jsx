import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProposalForm from '../components/ProposalForm';
import ProposalList from '../components/ProposalList';

export default function Proposals() {
  const [activeTab, setActiveTab] = useState('list');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    const userData = localStorage.getItem('sikgo_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sikgo_user');
    navigate('/login', { replace: true });
  };

  const displayName = user
    ? (user.fullName || user.name || (user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'User'))
    : 'Guest';

  return (
    <div className={`proposals-root ${mounted ? 'animated' : ''}`}>
      <nav className="topbar fixed-top">
        <div className="logo">
          <img src="/Icon.svg" alt="Logo" className="logo-icon" />
          <span className="logo-text">SIK-GO</span>
        </div>
        <div className="links">
          <a href="/">Home</a>
          <a href="/rooms">Rooms</a>
          <a href="/proposals" className="active">Proposals</a>
          {user && (
            <>
              <span className="welcome">Welcome back, {displayName}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <header className="proposals-hero">
        <h1>Manage Your Proposals</h1>
        <p>Create, view, and track the status of your submissions</p>
      </header>

      <section className="proposals-container">
        <div className="proposals-wrapper">
          <div className="tabs-section">
            <button
              onClick={() => setActiveTab('create')}
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            >
              ✏️ Create Proposal
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            >
              📋 View Proposals
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'create' && (
              <div className="tab-pane">
                <ProposalForm onSuccess={() => setActiveTab('list')} />
              </div>
            )}
            {activeTab === 'list' && (
              <div className="tab-pane">
                <ProposalList />
              </div>
            )}
          </div>
        </div>
      </section>

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

        html,body,#root,.proposals-root { max-width:100vw; overflow-x:hidden; }
        html,body,#root { margin:0; padding:0; }
        body {
          background: radial-gradient(1400px 900px at 10% 10%, #1a1f42 0%, #0f1429 45%, #0b0e1e 70%, #060712 100%);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue";
          -webkit-font-smoothing: antialiased;
          color:#e6e9f5;
          overscroll-behavior-x:none;
        }

        .proposals-root { 
          padding-top:86px;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        
        .proposals-root::before,
        .proposals-root::after {
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
        .proposals-root::before { 
          top:-50px; 
          right:-200px; 
          background:radial-gradient(circle at 20% 30%, #6ee7f955, transparent 50%); 
        }
        .proposals-root::after { 
          bottom:-300px; 
          left:-100px; 
          background:radial-gradient(circle at 80% 20%, #8b5cf655, transparent 50%); 
        }
        .topbar,.proposals-hero,.proposals-container { position:relative; z-index:1; }

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
        .links a.active { color: #6ee7f9; }
        .welcome { font-size:13px; font-weight:500; letter-spacing:.3px; color:#e6efff; }
        .logout-btn {
          padding:8px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.16);
          background:rgba(255,255,255,.06); color:#e8eef8; font-weight:600; cursor:pointer;
          transition:background .25s;
        }
        .logout-btn:hover { background:rgba(255,255,255,.12); }

        /* Hero */
        .proposals-hero {
          padding:80px 34px 40px; max-width:680px; margin:0 auto;
          display:grid; gap:22px; text-align:center; justify-items:center;
        }
        .proposals-hero h1 {
          margin:0; font-size:clamp(2.3rem,5vw,3.2rem); line-height:1.25;
          background:linear-gradient(90deg,#fff,#b5c6ff); -webkit-background-clip:text; color:transparent;
        }
        .proposals-hero p { margin:0; font-size:17px; color:#b4bccf; line-height:1.5; }

        /* Container */
        .proposals-container { padding:10px 34px 70px; max-width:1000px; margin:0 auto; width:100%; }
        .proposals-wrapper { display:grid; gap:24px; }

        /* Tabs */
        .tabs-section {
          display:flex; gap:12px; border-bottom:1px solid rgba(255,255,255,.12);
          padding-bottom:14px;
        }
        .tab-btn {
          padding:10px 18px; font-size:13.5px; font-weight:600; letter-spacing:.3px;
          border:none; background:transparent; color:#97a2b8; cursor:pointer;
          border-bottom:2px solid transparent; transition:.25s;
          position:relative; bottom:-2px;
        }
        .tab-btn:hover { color:#e6e9f5; }
        .tab-btn.active { 
          color:#6ee7f9; 
          border-bottom-color:#6ee7f9; 
          background:rgba(110, 231, 249, 0.1);
          border-radius:8px 8px 0 0;
        }

        /* Tab Content */
        .tabs-content { display:grid; gap:16px; }
        .tab-pane {
          padding:28px 26px 30px; border-radius:var(--radius-lg);
          background:var(--panel-bg); border:1px solid rgba(255,255,255,.02); 
          backdrop-filter:blur(10px);
          display:grid; gap:20px;
        }

        /* Responsive */
        @media (max-width:768px) {
          .topbar { padding:12px 20px; }
          .logo-icon { width:30px; height:30px; }
          .links { gap:16px; }
          .links a { font-size:12px; }
          .proposals-hero { padding:60px 24px 30px; }
          .proposals-hero h1 { font-size:clamp(1.8rem,4vw,2.4rem); }
          .proposals-container { padding:10px 20px 50px; }
          .tab-btn { padding:8px 14px; font-size:12px; }
        }

        @media (max-width:480px) {
          .topbar { flex-direction:column; gap:12px; padding:10px 16px; }
          .links { flex-direction:column; gap:8px; width:100%; }
          .links a { font-size:11px; }
          .proposals-hero { padding:50px 16px 25px; gap:16px; }
          .proposals-container { padding:10px 16px 40px; }
          .tabs-section { flex-direction:column; }
          .tab-btn { width:100%; text-align:center; }
        }
      `}</style>
    </div>
  );
}
