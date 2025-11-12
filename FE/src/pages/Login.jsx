import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const err = { email: '', password: '' };
    if (!email.trim()) err.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = 'Invalid email format.';
    if (!password) err.password = 'Password is required.';
    else if (password.length < 6) err.password = 'Minimum 6 characters.';
    setErrors(err);
    return !err.email && !err.password;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate async login process
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    alert('Login successful (simulation). Proceed to integrate your API.');
  };

  return (
    <div className="login-root">
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />

      {/* Back di luar card, di kiri atas card */}
      <div className="card-wrap">
        <Link to="/" className="back-btn" aria-label="Go Back Home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span>Go Back</span>
        </Link>

        <div className="card" role="region" aria-label="Login Form">
          {/* removed: .top-actions di dalam card */}
          <div className="brand">
            <img src="/Icon.svg" alt="App Logo" className="brand-icon" />
            <h1>Sign In</h1>
            <p>Please sign in to continue to the dashboard.</p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <label htmlFor="email">Email</label>
            <div className={`field ${errors.email ? 'error' : ''}`}>
              <input
                id="email"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {errors.email ? <span id="email-error" className="hint">{errors.email}</span> : null}
            </div>

            <label htmlFor="password">Password</label>
            <div className={`field with-icon ${errors.password ? 'error' : ''}`}>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                onClick={() => setShowPwd((v) => !v)}
              >
                {/* ...existing eye icons... */}
                {showPwd ? (
                  <svg viewBox="0 0 24 24"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7c2 0 3.8-.6 5.2-1.4l2.3 2.3 1.5-1.5-18-18-1.5 1.5 3.2 3.2C3 9 2 12 2 12s3 7 10 7c1.5 0 2.9-.3 4.1-.7l-2.2-2.2A5 5 0 017 12c0-.7.1-1.3.3-1.9L9 12a3 3 0 003 3 3 3 0 001.9-.7l1.4 1.4A4.9 4.9 0 0112 17a5 5 0 01-5-5c0-.5.1-1 .2-1.5l1.7 1.7A3 3 0 0012 15a3 3 0 002.1-.9l1.3 1.3C14.7 16.5 13.5 17 12 17z"/></svg>
                )}
              </button>
              {errors.password ? <span id="password-error" className="hint">{errors.password}</span> : null}
            </div>

            <div className="row">
              <label className="checkbox">
                <input type="checkbox" /> Remember me
              </label>
              <a className="link" href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>

            <button className="submit" type="submit" disabled={loading}>
              {loading ? <span className="spinner" aria-hidden="true" /> : 'Sign In'}
            </button>
          </form>

          <p className="sub">Don’t have an account? <Link to="/register" className="link">Sign up</Link></p>
        </div>
      </div>

      <style>{`
        :root {
          --bg1: #0f1226;
          --bg2: #141833;
          --fg: #e7e8ee;
          --muted: #a5acc1;
          --pri1: #8b5cf6;
          --pri2: #6ee7f9;
          --card: rgba(255,255,255,0.08);
          --border: rgba(255,255,255,0.12);
          --shadow: 0 20px 60px rgba(0,0,0,0.35);
          --radius: 14px;
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body { margin: 0; background: radial-gradient(1200px 800px at 10% 10%, #1a1f42 0%, #0b0e1e 60%, #060712 100%); color: var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji"; }
        .login-root {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: 32px 16px;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .aurora {
          position: absolute; inset: -20%;
          filter: blur(70px);
          opacity: .35; z-index: -1;
          transform: translateZ(0);
        }
        .a1 { background: radial-gradient(circle at 20% 30%, #6ee7f955, transparent 50%); }
        .a2 { background: radial-gradient(circle at 80% 20%, #8b5cf655, transparent 50%); }
        .a3 { background: radial-gradient(circle at 50% 80%, #22d3ee33, transparent 40%); }

        /* Wrapper untuk memosisikan back di luar card */
        .card-wrap {
          position: relative;
          width: 100%;
          max-width: 420px;
        }

        .card {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 28px;
          backdrop-filter: blur(14px) saturate(120%);
          -webkit-backdrop-filter: blur(14px) saturate(120%);
          animation: floatIn .7s ease both;
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translate3d(0, 12px, 0) scale(.98); }
          to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        .brand {
          display: grid; gap: 8px; text-align: center; margin-bottom: 18px;
        }
        .brand-icon {
          width:46px;
          height:46px;
          display:block;
          filter: drop-shadow(0 4px 14px rgba(139,92,246,.45));
          animation: popIn .5s ease;
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(.85) translateY(4px); }
          to { opacity:1; transform:scale(1) translateY(0); }
        }
        .brand h1 { margin: 4px 0 0; font-size: 22px; letter-spacing: .2px; }
        .brand p { margin: 0; color: var(--muted); font-size: 14px; }
        form { display: grid; gap: 14px; }
        label { font-size: 13px; color: #c7cbe2; }
        .field {
          position: relative;
          display: grid;
        }
        .field input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(6, 8, 22, 0.35);
          color: var(--fg);
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .field input::placeholder { color: #94a3b866; }
        .field input:focus {
          border-color: #7dd3fcaa;
          box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.12);
          background: rgba(6, 8, 22, 0.5);
        }
        .field.error input {
          border-color: #f87171bb;
          box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.12);
        }
        .hint {
          margin-top: 6px;
          font-size: 12px;
          color: #fca5a5;
        }
        .with-icon { display: grid; }
        .with-icon input { padding-right: 44px; }
        .icon-btn {
          position: absolute;
          right: 8px; top: 50%;
          transform: translateY(-50%);
          border: none; background: transparent; color: #cbd5e1;
          width: 34px; height: 34px; border-radius: 8px;
          display: grid; place-items: center; cursor: pointer;
          transition: background .2s, color .2s, transform .1s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.06); color: var(--fg); }
        .icon-btn:active { transform: translateY(-50%) scale(0.98); }
        .icon-btn svg { width: 18px; height: 18px; fill: currentColor; }
        .row {
          margin-top: 4px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; flex-wrap: wrap;
        }
        .checkbox { display: inline-flex; align-items: center; gap: 8px; color: #c7cbe2; font-size: 13px; cursor: pointer; }
        .checkbox input { accent-color: #7dd3fc; width: 16px; height: 16px; }
        .link {
          color: #93c5fd; text-decoration: none; font-size: 13px;
        }
        .link:hover { text-decoration: underline; }
        .submit {
          margin-top: 6px;
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 12px 14px;
          color: white;
          font-weight: 600;
          letter-spacing: .2px;
          cursor: pointer;
          background: linear-gradient(135deg, var(--pri2), var(--pri1));
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.35);
          transition: transform .08s ease, filter .2s ease, box-shadow .2s ease;
        }
        .submit:hover { filter: brightness(1.05); box-shadow: 0 16px 36px rgba(139, 92, 246, 0.45); }
        .submit:active { transform: translateY(1px); }
        .submit:disabled {
          cursor: not-allowed; opacity: .8; filter: saturate(.7);
        }
        .spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.45);
          border-top-color: white;
          display: inline-block;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sub {
          margin-top: 14px; text-align: center; color: var(--muted); font-size: 13px;
        }

        /* Back button di luar card, ikon di bawah teks */
        .back-btn {
          position: absolute;
          top: -48px; /* was -56px */
          left: 0;    /* kiri card */
          display: inline-flex;
          align-items: center;    /* was column layout */
          gap: 8px; /* adjust gap for arrow + text */
          padding: 6px 12px;
          border-radius: 12px;
          color: #e2e8f0;
          text-decoration: none;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(10px);
          transition: background .25s, border-color .25s, transform .12s, box-shadow .25s;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.30);
          box-shadow: 0 6px 20px -6px rgba(139,92,246,0.55);
        }
        .back-btn:active { transform: translateY(1px); }
        .back-btn svg {
          width:16px;
          height:16px;
          display:block;
          position:relative;
          top:2px; /* push arrow slightly down */
        }
        .back-btn span {
          font-size: 12px; font-weight: 600; letter-spacing: .3px;
        }

        @media (max-width: 420px) {
          .card { padding: 22px; }
          .back-btn { top: -44px; } /* adjust for mobile */
        }
      `}</style>
    </div>
  );
}
