import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const retryFlag = useRef(false);
  const cardRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const validate = () => {
    setError('');
    if (!fullName.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Minimum 6 characters.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      const envBase = import.meta.env.VITE_API_URL?.trim();
      const base = (envBase && envBase !== '') ? envBase.replace(/\/+$/,'') : 'http://localhost:3000';
      const endpoint = `${base}/api/auth/register`;
      const attempt = async () => {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: fullName, email, password })
        });
        const json = await res.json().catch(() => ({}));
        return { res, json };
      };

      let { res, json } = await attempt();

      if (res.status === 503 && !retryFlag.current) {
        retryFlag.current = true;
        setError('Backend connecting to database. Retrying...');
        await new Promise(r => setTimeout(r, 1500));
        ({ res, json } = await attempt());
      }

      if (!res.ok) {
        console.warn('Register failed:', res.status, json);
        const rawErr = json.error || json.message || '';
        const friendly =
          /buffering timed out/i.test(rawErr)
            ? 'Database still initializing. Please retry shortly.'
            : rawErr ||
              (res.status === 500
                ? 'Server error. Please check backend logs.'
                : `Registration failed (status ${res.status}).`);
        setError(friendly);
        return;
      }

      // Berhasil: tampilkan banner sukses dan opsi menuju login
      setSuccessMsg('Your account was created successfully. Please log in.');
      // Opsional: buat flag agar login menampilkan banner tanpa query
      sessionStorage.setItem('sikgo_registered_success','1');
      setFullName(''); setEmail(''); setPassword('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      if (cardRef.current) {
        cardRef.current.style.transform =
          `translateZ(0) rotateY(${dx * 6}deg) rotateX(${dy * -6}deg)`;
      }
      if (iconRef.current) {
        iconRef.current.style.transform =
          `translateZ(0) translateY(${dy * 6}px) scale(1.02)`;
      }
    };
    const handleLeave = () => {
      if (cardRef.current) cardRef.current.style.transform = '';
      if (iconRef.current) iconRef.current.style.transform = '';
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <div className={`login-root ${mounted ? 'animated' : ''}`}>
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />

      <div className="card-wrap">
        <Link to="/" className="back-btn" aria-label="Back Home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span>Back</span>
        </Link>

        <div className="card" role="region" aria-label="Register Form" ref={cardRef}>
          <div className="brand">
            <img src="/Icon.svg" alt="App Logo" className="brand-icon" ref={iconRef} />
            <h1>Create Account</h1>
            <p>Sign up to start reserving campus facilities.</p>
          </div>

          {successMsg ? (
            <div className="notice success" role="status">
              <strong>{successMsg}</strong>
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="submit"
                  onClick={() => navigate('/login')}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  Go to Login
                </button>
              </div>
            </div>
          ) : null}

          {error ? <div className="notice error" role="alert">{error}</div> : null}

          <form onSubmit={onSubmit} noValidate>
            <label htmlFor="fullName">Full Name</label>
            <div className="field">
              <input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <label htmlFor="email">Email</label>
            <div className="field">
              <input
                id="email"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="field">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button className="submit" type="submit" disabled={loading}>
              {loading ? <span className="spinner" aria-hidden="true" /> : 'Create Account'}
            </button>
          </form>

          <p className="sub">Already have an account? <Link to="/login" className="link">Sign in</Link></p>
        </div>
      </div>
      <div className="bottom-bg" aria-hidden="true"></div>
      <style>{`
        :root { 
          --fg:#e7e8ee; 
          --muted:#a5acc1; 
          --border:rgba(255,255,255,0.12); 
          --pri1:#8b5cf6; 
          --pri2:#6ee7f9; 
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body { margin: 0; background: radial-gradient(1200px 800px at 10% 10%, #1a1f42 0%, #0b0e1e 60%, #060712 100%); color: var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue"; }
        .login-root { min-height: 100dvh; display: grid; place-items: center; padding: 32px 16px; position: relative; overflow: hidden; isolation: isolate; opacity: 0; animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .login-root.animated { opacity: 1; }
        .aurora { position: absolute; inset: -20%; filter: blur(70px); opacity: .35; z-index: -1; transform: translateZ(0); }
        .a1 { background: radial-gradient(circle at 20% 30%, #6ee7f955, transparent 50%); }
        .a2 { background: radial-gradient(circle at 80% 20%, #8b5cf655, transparent 50%); }
        .a3 { background: radial-gradient(circle at 50% 80%, #22d3ee33, transparent 40%); }

        .card-wrap {
          position: relative;
          width: 100%;
          max-width: 560px;
        }

        .back-btn { position: absolute; top: -48px; left: 0; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 12px; color: #e2e8f0; text-decoration: none; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(10px); transition: background .25s, border-color .25s, transform .12s, box-shadow .25s; }
        .back-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.30); box-shadow: 0 6px 20px -6px rgba(139,92,246,0.55); }
        .back-btn svg { width:16px; height:16px; display:block; position:relative; top:2px; }
        .back-btn span {
          font-size:13px; /* was 12px */
          font-weight:600;
          letter-spacing:.35px;
          color:#ffffff;
        }
        .back-btn {
          /* ...existing code... */
          color:#ffffff;
        }
        .back-btn:hover {
          /* ...existing code... */
          color:#ffffff;
        }

        .card {
          width: 100%;
          max-width: 560px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
          padding: 28px;
          backdrop-filter: blur(14px) saturate(120%);
          -webkit-backdrop-filter: blur(14px) saturate(120%);
          animation: floatIn .7s ease both;
          will-change: transform;
          transition: transform .35s cubic-bezier(.16,.72,.29,.99);
        }

        .brand { display: grid; gap: 8px; text-align: center; margin-bottom: 18px; }
        .brand-icon { width:46px; height:46px; display:block; filter: drop-shadow(0 4px 14px rgba(139,92,246,.45)); }
        .brand h1 {
          margin: 4px 0 0;
          font-size: 22px;
          letter-spacing: .2px;
          color: var(--fg);
        }
        .brand p { margin: 0; color: var(--muted); font-size: 14px; }

        form { display: grid; gap: 14px; }
        label { font-size: 13px; color: #c7cbe2; }
        .field { position: relative; display: grid; }
        .field input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border); background: rgba(6, 8, 22, 0.35); color: var(--fg); outline: none; transition: border-color .2s, box-shadow .2s, background .2s; }
        .field input::placeholder { color: #94a3b866; }
        .field input:focus { border-color: #7dd3fcaa; box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.12); background: rgba(6, 8, 22, 0.5); }
        .field.error input { border-color: #f87171bb; box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.12); }
        .hint { margin-top: 6px; font-size: 12px; color: #fca5a5; }
        .with-icon input { padding-right: 44px; }
        .icon-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); border: none; background: transparent; color: #cbd5e1; width: 34px; height: 34px; border-radius: 8px; display: grid; place-items: center; cursor: pointer; transition: background .2s, color .2s, transform .1s; }
        .icon-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }

        .submit {
          margin-top: 6px;
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 12px 14px;
          // color: #fff;
          font-weight: 600;
          letter-spacing: .2px;
          cursor: pointer;
          background: linear-gradient(135deg, var(--pri2), var(--pri1));
          box-shadow: 0 12px 30px rgba(139,92,246,0.35);
          transition: transform .08s ease, filter .2s ease, box-shadow .2s ease;
          position: relative;
          overflow: hidden;
        }
        .submit:hover { filter: brightness(1.06); box-shadow: 0 16px 36px rgba(139,92,246,0.45); }
        .submit:active { transform: translateY(1px); }
        .submit:disabled { cursor: not-allowed; opacity:.75; filter: saturate(.8); }
        .submit::after {
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.35) 50%,rgba(255,255,255,0) 100%);
          transform:translateX(-100%);
          animation: shine 3.2s linear infinite;
          pointer-events:none;
        }

        .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,.45); border-top-color: white; display: inline-block; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatIn {
          from { opacity:0; transform:translate3d(0,18px,0) scale(.96); }
          to { opacity:1; transform:translate3d(0,0,0) scale(1); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(.85) translateY(6px); }
          to { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes shine {
          0% { transform:translateX(-100%); }
          60% { transform:translateX(120%); }
          100% { transform:translateX(120%); }
        }
        @keyframes drift1 {
          0% { transform:translate(-6%, -4%) scale(1); }
          50% { transform:translate(4%, 3%) scale(1.05); }
          100% { transform:translate(-6%, -4%) scale(1); }
        }
        @keyframes drift2 {
          0% { transform:translate(3%, -2%) scale(1); }
          50% { transform:translate(-5%, 4%) scale(1.08); }
          100% { transform:translate(3%, -2%) scale(1); }
        }
        @keyframes drift3 {
          0% { transform:translate(0%, 0%) scale(1); }
          50% { transform:translate(2%, -3%) scale(1.06); }
          100% { transform:translate(0%, 0%) scale(1); }
        }
        .a1 { animation: drift1 18s ease-in-out infinite; }
        .a2 { animation: drift2 22s ease-in-out infinite; }
        .a3 { animation: drift3 26s ease-in-out infinite; }

        .link { color: #93c5fd; text-decoration: none; }
        .link:hover { text-decoration: underline; }

        .notice {
          margin: 4px 0 14px;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.35;
        }
        .notice.success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #bbf7d0;
        }
        .notice.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fecaca;
        }
        .sub {
          margin-top: 14px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
        }

        .bottom-bg {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 300px;
          background: url('/BackgroundBawah.svg') center bottom / cover no-repeat;
          pointer-events: none;
          opacity: .85;
          z-index: 0;
        }
        .bottom-bg::after {
          content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(15,18,38,0.9), rgba(15,18,38,0.5) 40%, transparent 75%);
        }
        @media (max-width:640px){
          .bottom-bg { height:220px; opacity:.9; }
        }

        @media (max-width: 640px) {
          .card-wrap, .card { max-width: 100%; }
        }
        @media (max-width: 420px) {
          .card { padding: 22px; }
          .back-btn { top: -44px; }
        }
      `}</style>
    </div>
  );
}
