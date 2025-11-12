import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // tambahkan useNavigate

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');
  const navigate = useNavigate(); // init navigator

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

  return (
    <div className="home-root">
      <nav className="topbar">
        <div className="logo">
          <img src="/Icon.svg" alt="Logo" className="logo-icon" />
          <span className="logo-text">SIK-GO</span>
        </div>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/about">About Us</Link>
          <Link to="/login" className="login-btn">Log In</Link>
        </div>
      </nav>

      <header className="hero">
        <h1>Welcome to <span className="nowrap">SIK‑GO</span></h1>
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
            <p>Upload an image or PDF to be processed.</p>
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

      <footer className="footer">
        <span>© {new Date().getFullYear()} SIK-GO</span>
      </footer>

      <style>{`
        /* Reset agar tidak muncul border putih di tepi layar */
        html, body, #root { margin:0; padding:0; }
        body { 
          background: radial-gradient(1000px 700px at 15% 15%, #1c2344 0%, #0b0f1f 55%, #06070f 100%);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji";
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .topbar {
          display:flex; justify-content:space-between; align-items:center;
          padding:14px 34px; backdrop-filter:blur(12px);
          background:rgba(255,255,255,0.04); border-bottom:none;
        }
        .logo { display:flex; align-items:center; gap:12px; }
        .logo-icon { width:36px; height:36px; display:block; }
        .logo-text { font-weight:700; letter-spacing:.5px; font-size:18px; background:linear-gradient(90deg,#6ee7f9,#8b5cf6); -webkit-background-clip:text; color:transparent; }
        .links { display:flex; gap:24px; align-items:center; }
        .links a { color:#c7cfdd; font-size:14px; }
        .links a:not(.login-btn):hover { color:#fff; }
        .login-btn {
          padding:8px 16px; border-radius:999px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f; font-weight:600;
          box-shadow:0 6px 20px -4px rgba(139,92,246,.45); transition:transform .15s, box-shadow .3s;
        }
        .login-btn:hover { transform:translateY(-2px); box-shadow:0 10px 26px -4px rgba(139,92,246,.55); }

        .hero {
          padding:80px 34px 40px;
          display:grid; justify-items:center; text-align:center; gap:22px;
          max-width:680px; margin:0 auto;
        }
        .hero h1 {
          margin:0; font-size:clamp(2.3rem,5vw,3.2rem); line-height:1.25;
          display:inline-block; -webkit-text-fill-color:transparent; padding-bottom:6px; overflow:visible;
          background:linear-gradient(90deg,#fff,#b5c6ff); -webkit-background-clip:text; color:transparent;
        }
        .hero p { margin:0; font-size:17px; color:#b4bccf; line-height:1.5; }

        .footer {
          margin-top:auto; padding:28px 34px; text-align:center; font-size:12px; color:#8191a8;
          background:linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.04)); border-top:none;
        }

        .nowrap { white-space:nowrap; }

        .links a, .login-btn { text-decoration:none; }
        .links a:hover, .links a:focus, .login-btn:hover, .login-btn:focus { text-decoration:none; }

        /* === Scan Document Section === */
        .doc-scan {
          padding: 10px 34px 70px;
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
        }
        .scan-box {
          display: grid;
          gap: 22px;
          background: linear-gradient(170deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.12);
          padding: 28px 26px 34px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .scan-head h2 {
          margin:0;
          font-size:20px;
          background:linear-gradient(90deg,#ffffff,#b5c6ff);
          -webkit-background-clip:text;
          color:transparent;
        }
        .scan-head p {
          margin:6px 0 0;
          font-size:13px;
          color:#97a2b8;
          letter-spacing:.2px;
        }
        .dropzone {
          position:relative;
          border:1.5px dashed rgba(255,255,255,0.28);
          border-radius:18px;
          min-height:200px;
          display:grid;
          place-items:center;
          padding:20px;
          cursor:pointer;
          color:#c7d0df;
          background:rgba(255,255,255,0.04);
          transition:border-color .3s, background .3s;
          overflow:hidden;
        }
        .dropzone:hover {
          border-color: rgba(139,92,246,.6);
          background:rgba(255,255,255,0.07);
        }
        .dropzone.disabled { opacity:.7; cursor:default; }
        .placeholder {
          text-align:center;
          display:grid;
          gap:6px;
        }
        .placeholder strong { font-size:14px; }
        .placeholder span { font-size:12px; color:#a6b2c6; }
        .placeholder em { font-size:11px; color:#8a95a8; font-style:normal; }
        .upload-icon {
          width:48px;
          height:48px;
          object-fit:contain;
          opacity:.85;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,.35));
          transform: translateX(28px); /* geser ke kanan */
        }
        .preview-wrap {
          display:grid;
          grid-template-columns: 100px 1fr auto;
          gap:18px;
          align-items:center;
          width:100%;
        }
        .preview-img {
          width:100px;
          height:100px;
          object-fit:cover;
          border-radius:12px;
          border:1px solid rgba(255,255,255,0.18);
          box-shadow:0 6px 18px -6px rgba(0,0,0,.4);
        }
        .file-icon {
          width:100px;
          height:100px;
            border-radius:12px;
            background:linear-gradient(140deg,#6ee7f9,#8b5cf6);
            display:grid;
            place-items:center;
            font-weight:600;
            font-size:18px;
            color:#101524;
            letter-spacing:.5px;
        }
        .meta { display:grid; gap:4px; align-content:start; }
        .fname { font-size:14px; font-weight:600; color:#eef1f7; word-break:break-all; }
        .fsize { font-size:12px; color:#93a0b4; }
        .reset-btn {
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.16);
          color:#e6ecf5;
          font-size:12px;
          padding:8px 14px;
          border-radius:10px;
          cursor:pointer;
          transition:background .25s, border-color .25s;
          height:36px;
        }
        .reset-btn:hover:not(:disabled) { background:rgba(255,255,255,0.14); }
        .reset-btn:disabled { opacity:.6; cursor:not-allowed; }

        /* Tambah: wrapper tombol dan style tombol submit */
        .btns { display: flex; gap: 10px; align-items: center; justify-self: end; }
        .submit-btn {
          height: 36px;
          padding: 8px 14px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          color: #0b0f1f;
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          box-shadow: 0 8px 22px -6px rgba(139, 92, 246, 0.5);
          cursor: pointer;
          transition: filter .2s, box-shadow .2s, transform .06s;
        }
        .submit-btn:hover { filter: brightness(1.05); box-shadow: 0 12px 28px -6px rgba(139,92,246,.6); }
        .submit-btn:active { transform: translateY(1px); }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }

        .scan-overlay {
          position:absolute;
          inset:0;
          background:rgba(12,16,28,0.72);
          backdrop-filter:blur(6px);
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:12px;
          font-size:13px;
          letter-spacing:.3px;
        }
        .spinner {
          width:32px; height:32px;
          border-radius:50%;
          border:3px solid rgba(255,255,255,.25);
          border-top-color:#fff;
          animation:spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .result-box {
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:16px;
          padding:20px 18px 18px;
          display:grid;
          gap:12px;
          position:relative;
        }
        .result-box h3 {
          margin:0;
          font-size:15px;
          font-weight:600;
          letter-spacing:.4px;
          color:#e9edf5;
        }
        .result-box pre {
          margin:0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
          font-size:12px;
          line-height:1.55;
          white-space:pre-wrap;
          color:#c9d4e3;
          max-height:260px;
          overflow:auto;
          scrollbar-width:thin;
        }
        .result-box pre::-webkit-scrollbar {
          width:8px;
        }
        .result-box pre::-webkit-scrollbar-track {
          background:transparent;
        }
        .result-box pre::-webkit-scrollbar-thumb {
          background:rgba(255,255,255,0.15);
          border-radius:4px;
        }

        @media (max-width:760px) {
          .preview-wrap { grid-template-columns: 80px 1fr auto; gap:14px; }
          .preview-img, .file-icon { width:80px; height:80px; }
          .doc-scan { padding:10px 20px 60px; }
          .scan-box { padding:24px 20px 30px; }
        }

        @media (max-width:640px) {
          .topbar { padding:12px 18px; }
          .links { gap:14px; }
          .hero { padding:70px 20px 34px; }
        }
      `}</style>
    </div>
  );
}
