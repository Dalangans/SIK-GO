import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProposalStatusCard from '../components/ProposalStatusCard';

export default function Proposals() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
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
          <a href="/bookings">Bookings</a>
          <a href="/proposals" className="active">Proposals</a>
          {user && (
            <>
              <span className="welcome">Welcome, {displayName}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <header className="proposals-hero">
        <h1>Your Proposals</h1>
        <p>Create, submit, and track the status of your proposals</p>
      </header>

      <main className="proposals-main">
        <ProposalStatusCard />
      </main>

      <div className="background-bottom">
        <img src="/BackgroundBawah.svg" alt="Background" className="background-img" />
      </div>

      <style>{`
        :root {
          --font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          --grad-main: radial-gradient(1400px 900px at 10% 10%, #1a1f42 0%, #0f1429 45%, #0b0e1e 70%, #060712 100%);
          --color-text: #cfd6e4;
          --color-text-dim: #97a2b8;
          --grad-link: linear-gradient(90deg, #6ee7f9, #8b5cf6);
        }

        html, body, #root {
          margin: 0;
          padding: 0;
        }

        body {
          background: var(--grad-main);
          font-family: var(--font-stack);
          -webkit-font-smoothing: antialiased;
          color: #e6e9f5;
          overscroll-behavior-x: none;
        }

        .proposals-root {
          background: var(--grad-main);
          color: var(--color-text);
          min-height: 100vh;
          width: 100%;
          padding-top: 60px;
          padding-bottom: 70px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: auto;
          overflow-x: hidden;
          font-family: var(--font-stack);
        }

        .proposals-root::before,
        .proposals-root::after {
          content: "";
          position: fixed;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .proposals-root::before {
          top: -120px;
          right: -140px;
          background: radial-gradient(circle, rgba(110, 231, 249, 0.3) 0%, transparent 50%);
        }

        .proposals-root::after {
          bottom: -140px;
          left: -100px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 50%);
        }

        .topbar, .proposals-hero, .proposals-main {
          position: relative;
          z-index: 1;
        }

        /* Topbar */
        .topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 34px;
          backdrop-filter: blur(12px);
          background: rgba(0, 0, 0, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 999;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
        }

        .logo-text {
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.5px;
          background: var(--grad-link);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .links {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-left: auto;
        }

        .links a {
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.25px;
          color: var(--color-text);
          text-decoration: none;
          position: relative;
          padding: 4px 4px;
          transition: color 0.25s;
        }

        .links a::after {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 0;
          height: 2px;
          background: var(--grad-link);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.16, 0.72, 0.25, 1);
        }

        .links a:hover,
        .links a:focus-visible {
          color: var(--color-white);
        }

        .links a:hover::after,
        .links a:focus-visible::after {
          transform: scaleX(1);
        }

        .links a.active {
          color: #6ee7f9;
        }

        .welcome {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.3px;
          color: #e6efff;
          margin-left: auto;
          margin-right: 16px;
        }

        .logout-btn {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          color: #e8eef8;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s;
          font-family: var(--font-stack);
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        /* Hero */
        .proposals-hero {
          padding: 80px 34px 40px;
          max-width: 680px;
          margin: 0 auto;
          display: grid;
          gap: 22px;
          text-align: center;
          justify-items: center;
        }

        .proposals-hero h1 {
          margin: 0;
          font-size: clamp(2.3rem, 5vw, 3.2rem);
          line-height: 1.25;
          background: linear-gradient(90deg, #fff, #b5c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .proposals-hero p {
          margin: 0;
          font-size: 17px;
          color: #b4bccf;
          line-height: 1.5;
        }

        /* Main Content */
        .proposals-main {
          padding: 20px 34px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* Background Bottom */
        .background-bottom {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 100%;
          height: auto;
          pointer-events: none;
          z-index: 0;
        }

        .background-img {
          width: 100%;
          height: auto;
          display: block;
          opacity: 0.4;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .topbar {
            padding: 12px 20px;
          }

          .logo-icon {
            width: 30px;
            height: 30px;
          }

          .links {
            gap: 16px;
            margin-left: 20px;
          }

          .links a {
            font-size: 12px;
          }

          .welcome {
            display: none;
          }

          .proposals-hero {
            padding: 60px 24px 30px;
          }

          .proposals-hero h1 {
            font-size: clamp(1.8rem, 4vw, 2.4rem);
          }

          .proposals-main {
            padding: 20px 24px;
          }
        }

        @media (max-width: 480px) {
          .topbar {
            flex-direction: column;
            gap: 12px;
            padding: 10px 16px;
          }

          .links {
            flex-direction: column;
            gap: 8px;
            width: 100%;
            margin-left: 0;
          }

          .links a {
            font-size: 11px;
          }

          .logout-btn {
            width: 100%;
          }

          .proposals-hero {
            padding: 50px 16px 25px;
            gap: 16px;
          }

          .proposals-main {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
}
