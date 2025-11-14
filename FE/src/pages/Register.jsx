import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const retryFlag = useRef(false);

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

  return (
    <div className="login-root">
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />

      <div className="card-wrap">
        <Link to="/" className="back-btn" aria-label="Go Back Home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span>Go Back</span>
        </Link>

        <div className="card" role="region" aria-label="Register Form">
          <div className="brand">
            <img src="/Icon.svg" alt="App Logo" className="brand-icon" />
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

      <style>{`
        :root { --fg:#e7e8ee; --muted:#a5acc1; --border:rgba(255,255,255,0.12); }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body { margin: 0; background: radial-gradient(1200px 800px at 10% 10%, #1a1f42 0%, #0b0e1e 60%, #060712 100%); color: var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue"; }
        .login-root { min-height: 100dvh; display: grid; place-items: center; padding: 32px 16px; position: relative; overflow: hidden; isolation: isolate; }
        .aurora { position: absolute; inset: -20%; filter: blur(70px); opacity: .35; z-index: -1; transform: translateZ(0); }
        .a1 { background: radial-gradient(circle at 20% 30%, #6ee7f955, transparent 50%); }
        .a2 { background: radial-gradient(circle at 80% 20%, #8b5cf655, transparent 50%); }
        .a3 { background: radial-gradient(circle at 50% 80%, #22d3ee33, transparent 40%); }

        .card-wrap { position: relative; width: 100%; max-width: 420px; }

        .back-btn { position: absolute; top: -48px; left: 0; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 12px; color: #e2e8f0; text-decoration: none; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(10px); transition: background .25s, border-color .25s, transform .12s, box-shadow .25s; }
        .back-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.30); box-shadow: 0 6px 20px -6px rgba(139,92,246,0.55); }
        .back-btn svg { width:16px; height:16px; display:block; position:relative; top:2px; }
        .back-btn span { font-size: 12px; font-weight: 600; letter-spacing: .3px; }

        .card { width: 100%; background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04)); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.35); padding: 28px; backdrop-filter: blur(14px) saturate(120%); -webkit-backdrop-filter: blur(14px) saturate(120%); }

        .brand { display: grid; gap: 8px; text-align: center; margin-bottom: 18px; }
        .brand-icon { width:46px; height:46px; display:block; filter: drop-shadow(0 4px 14px rgba(139,92,246,.45)); }
        .brand h1 { margin: 4px 0 0; font-size: 22px; letter-spacing: .2px; }
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

        .submit { margin-top: 6px; width: 100%; border: none; border-radius: 12px; padding: 12px 14px; color: white; font-weight: 600; letter-spacing: .2px; cursor: pointer; background: linear-gradient(135deg, var(--pri2), var(--pri1)); box-shadow: 0 12px 30px rgba(139, 92, 246, 0.35); transition: transform .08s ease, filter .2s ease, box-shadow .2s ease; }
        .submit:hover { filter: brightness(1.05); box-shadow: 0 16px 36px rgba(139, 92, 246, 0.45); }
        .submit:active { transform: translateY(1px); }
        .submit:disabled { cursor: not-allowed; opacity: .8; filter: saturate(.7); }

        .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,.45); border-top-color: white; display: inline-block; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

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

        @media (max-width: 420px) {
          .card { padding: 22px; }
          .back-btn { top: -44px; }
        }
      `}</style>
    </div>
  );
}
