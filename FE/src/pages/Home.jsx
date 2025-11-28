import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');
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

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult('');
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview('');
    }
    setScanning(true);
    // Simulasi proses OCR / ekstraksi
    setTimeout(() => {
      setScanning(false);
      setResult(`Extraction completed (simulation).
Name: ${f.name}
Type: ${f.type || 'unknown'}
Size: ${(f.size / 1024).toFixed(1)} KB

OCR text will appear here after integrating your API.`);
    }, 1400);
  };

  const onChangeFile = (e) => handleFile(e.target.files?.[0]);
  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };
  const prevent = (e) => e.preventDefault();

  // Auth-guard saat submit: jika belum login, redirect ke /login
  const onSubmitDoc = async () => {
    if (!file || scanning) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login'); // arahkan ke login terlebih dahulu
      return;
    }
    setResult((prev) => (prev?.trim() ? prev + '\n\nSubmitting document...' : 'Submitting document...'));
    await new Promise((r) => setTimeout(r, 1000));
    setResult((prev) => (prev?.trim() ? prev + '\nSubmit complete (simulation).' : 'Submit complete (simulation).'));
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sikgo_user');
    navigate('/login', { replace: true });
  };

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
      </header>

      {/* Scan / Upload Document */}
      <section
        className="doc-scan"
        onDragOver={prevent}
        onDragEnter={prevent}
        onDrop={onDrop}
      >
        <div className="scan-box">
          <div className="scan-head">
            <h2>Scan / Upload Document</h2>
            <p>Upload image/PDF, AI extracts text & key data (simulation).</p>
          </div>

            <label className={`dropzone ${scanning ? 'disabled' : ''}`}>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={onChangeFile}
                disabled={scanning}
                hidden
              />
              {!file && (
                <div className="placeholder">
                  <img src="/Upload.svg" alt="Upload" className="upload-icon" />
                  <strong>Drag & Drop</strong>
                  <span>or click to select file</span>
                  <em>Format: JPG, PNG, PDF</em>
                </div>
              )}
              {file && (
                <div className="preview-wrap">
                  {preview ? (
                    <img src={preview} alt="preview" className="preview-img" />
                  ) : (
                    <div className="file-icon">
                      <span>{file.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                    </div>
                  )}
                  <div className="meta">
                    <div className="fname">{file.name}</div>
                    <div className="fsize">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="btns">
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={onSubmitDoc}
                      disabled={scanning}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="reset-btn"
                      onClick={() => {
                        setFile(null);
                        setPreview('');
                        setResult('');
                        setScanning(false);
                      }}
                      disabled={scanning}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
              {scanning && <div className="scan-overlay"><div className="spinner" /> <span>Scanning...</span></div>}
            </label>

          {result && (
            <div className="result-box">
              <h3>Extraction Result</h3>
              <pre>{result}</pre>
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
        body {
          background: var(--grad-main), var(--grad-accent-purple), var(--grad-accent-deep), linear-gradient(180deg, rgba(67,27,87,.10), rgba(14,20,38,.10));
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue";
          -webkit-font-smoothing: antialiased;
          color:#e6e9f5;
          overscroll-behavior-x:none;
        }

        .home-root { padding-top:86px; }
        .home-root::before,
        .home-root::after {
          content:""; position:fixed; inset:auto; pointer-events:none; width:520px; height:520px;
          border-radius:50%; filter:blur(120px); opacity:.22; z-index:0;
        }
        .home-root::before { top:-120px; right:-140px; background:radial-gradient(closest-side, rgba(95,43,122,.6), rgba(95,43,122,0)); }
        .home-root::after { bottom:-140px; left:-180px; background:radial-gradient(closest-side, rgba(50,22,75,.55), rgba(50,22,75,0)); }
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

        /* Scan box */
        .doc-scan { padding:10px 34px 70px; max-width:960px; margin:0 auto; width:100%; }
        .scan-box {
          display:grid; gap:22px; padding:28px 26px 30px; border-radius:var(--radius-lg);
          background:var(--panel-bg); border:1px solid rgba(255,255,255,.02); backdrop-filter:blur(10px);
        }
        .scan-head h2 {
          margin:0; font-size:20px; background:linear-gradient(90deg,#ffffff,#b5c6ff);
          -webkit-background-clip:text; color:transparent;
        }
        .scan-head p { margin:6px 0 0; font-size:13px; color:var(--color-text-dim); letter-spacing:.2px; }
        .dropzone {
          position:relative; min-height:200px; display:grid; place-items:center;
          border:1.5px dashed rgba(255,255,255,.28); border-radius:18px; padding:20px;
          background:rgba(255,255,255,.04); cursor:pointer; color:#c7d0df; transition:.3s;
        }
        .dropzone:hover { border-color:rgba(139,92,246,.6); background:rgba(255,255,255,.07); }
        .dropzone.disabled { opacity:.7; cursor:default; }
        .placeholder { display:grid; gap:6px; text-align:center; }
        .placeholder strong { font-size:14px; }
        .placeholder span { font-size:12px; color:#a6b2c6; }
        .placeholder em { font-size:11px; color:#8a95a8; font-style:normal; }
        .upload-icon { width:40px; height:40px; opacity:.85; filter:drop-shadow(0 10px 12px rgba(0,0,0,.35)); }
        .preview-wrap { display:grid; grid-template-columns:100px 1fr auto; gap:18px; align-items:center; width:100%; }
        .preview-img,.file-icon {
          width:100px; height:100px; border-radius:12px;
        }
        .preview-img { object-fit:cover; border:1px solid rgba(255,255,255,.18); box-shadow:0 6px 18px -6px rgba(0,0,0,.4); }
        .file-icon {
          background:linear-gradient(140deg,#6ee7f9,#8b5cf6); display:grid; place-items:center;
          font-weight:600; font-size:18px; color:#101524; letter-spacing:.5px;
        }
        .meta { display:grid; gap:4px; }
        .fname { font-size:14px; font-weight:600; color:#eef1f7; word-break:break-all; }
        .fsize { font-size:12px; color:#93a0b4; }
        .btns { display:flex; gap:10px; }
        .submit-btn {
          height:36px; padding:8px 14px; border:none; border-radius:10px; font-weight:600;
          color:#0b0f1f; background:linear-gradient(135deg,#6ee7f9,#8b5cf6);
          box-shadow:0 8px 22px -6px rgba(139,92,246,.5); cursor:pointer; transition:.2s;
        }
        .submit-btn:hover { filter:brightness(1.05); box-shadow:0 12px 28px -6px rgba(139,92,246,.6); }
        .submit-btn:disabled { opacity:.6; cursor:not-allowed; }
        .reset-btn {
          height:36px; padding:8px 14px; background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.16); border-radius:10px; color:#e6ecf5;
          font-size:12px; cursor:pointer; transition:.25s;
        }
        .reset-btn:hover:not(:disabled) { background:rgba(255,255,255,.14); }
        .reset-btn:disabled { opacity:.6; cursor:not-allowed; }
        .scan-overlay {
          position:absolute; inset:0; background:rgba(12,16,2,.72); backdrop-filter:blur(6px);
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;
          font-size:13px; letter-spacing:.3px;
        }
        .spinner {
          width:32px; height:32px; border-radius:50%;
          border:3px solid rgba(255,255,255,.25); border-top-color:#fff;
          animation:spin .8s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .result-box {
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12);
          border-radius:16px; padding:20px 18px 18px; display:grid; gap:12px;
        }
        .result-box h3 { margin:0; font-size:15px; font-weight:600; letter-spacing:.4px; color:#e9edf5; }
        .result-box pre {
          margin:0; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas;
          font-size:12px; line-height:1.55; white-space:pre-wrap; color:#c9d4e3;
          max-height:260px; overflow:auto;
        }

        /* About */
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
        }
        @media (max-width:460px){
          .logo-text { display:none; }
          .links { gap:14px; }
        }

        /* Simple entrance animation */
        .home-root .hero,.home-root .doc-scan,.home-root .about-us,.home-root .contact-block {
          opacity:0; transform:translateY(20px) scale(.97);
        }
        .home-root.animated .hero,
        .home-root.animated .doc-scan,
        .home-root.animated .about-us,
        .home-root.animated .contact-block {
          opacity:1; transform:translateY(0) scale(1);
          transition:opacity .7s ease, transform .7s cubic-bezier(.16,.72,.25,1);
        }
        .home-root.animated .hero { transition-delay:.05s; }
        .home-root.animated .doc-scan { transition-delay:.18s; }
        .home-root.animated .about-us { transition-delay:.28s; }
        .home-root.animated .contact-block { transition-delay:.38s; }
      `}</style>
    </div>
  );
}
