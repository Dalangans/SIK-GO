import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('create');
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

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
    <div className={`bookings-root ${mounted ? 'animated' : ''}`}>
      <nav className="topbar fixed-top">
        <div className="logo">
          <img src="/Icon.svg" alt="Logo" className="logo-icon" />
          <span className="logo-text">SIK-GO</span>
        </div>
        <div className="links">
          <a href="/">Home</a>
          <a href="/rooms">Rooms</a>
          <a href="/bookings" className="active">Bookings</a>
          {user && (
            <>
              <span className="welcome">Welcome back, {displayName}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <header className="bookings-hero">
        <h1>Booking Management</h1>
        <p>Manage your room reservations</p>
      </header>

      <section className="bookings-container">
        <div className="bookings-wrapper">
          <div className="tabs-section">
            <button
              onClick={() => setActiveTab('create')}
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            >
              Create Booking
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            >
              My Bookings
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'create' && <BookingForm onSuccess={() => setActiveTab('list')} />}
            {activeTab === 'list' && <BookingList />}
          </div>
        </div>
      </section>

      <style>{`
        :root {
          --grad-main: radial-gradient(1400px 900px at 10% 10%, #1a1f42 0%, #0f1429 45%, #0b0e1e 70%, #060712 100%);
          --grad-accent-purple: radial-gradient(800px 520px at 86% 12%, rgba(67,27,87,.55) 0%, rgba(67,27,87,0) 60%);
          --grad-accent-deep: radial-gradient(680px 420px at 20% 88%, rgba(50,22,75,.45) 0%, rgba(50,22,75,0) 60%);
          --grad-link: linear-gradient(90deg,#6ee7f9,#8b5cf6);
          --panel-bg: linear-gradient(170deg,rgba(255,255,255,.07),rgba(255,255,255,.02));
          --radius-lg: 20px;
          --color-text: #cfd6e4;
          --color-text-dim: #97a2b8;
          --color-white: #ffffff;
        }

        .bookings-root {
          background: var(--grad-main);
          color: var(--color-text);
          min-height: 100vh;
          padding-top: 60px;
          padding-bottom: 70px;
          position: relative;
          overflow: hidden;
        }

        .bookings-root::before,
        .bookings-root::after {
          content: "";
          position: absolute;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .bookings-root::before {
          top: -120px;
          right: -140px;
          background: var(--grad-accent-purple);
        }

        .bookings-root::after {
          bottom: -140px;
          left: -180px;
          background: var(--grad-accent-deep);
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
          z-index: 100;
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
          color: transparent;
        }

        .links {
          display: flex;
          align-items: center;
          gap: 24px;
          position: relative;
          z-index: 1;
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

        .links a.active {
          color: #6ee7f9;
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

        .links a:hover::after,
        .links a.active::after {
          transform: scaleX(1);
        }

        .welcome {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.3px;
          color: #e6efff;
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
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        /* Hero */
        .bookings-hero {
          padding: 80px 34px 40px;
          max-width: 680px;
          margin: 0 auto;
          display: grid;
          gap: 22px;
          text-align: center;
          justify-items: center;
          position: relative;
          z-index: 1;
        }

        .bookings-hero h1 {
          margin: 0;
          font-size: clamp(2.3rem, 5vw, 3.2rem);
          line-height: 1.25;
          background: linear-gradient(90deg, #fff, #b5c6ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        .bookings-hero p {
          margin: 0;
          font-size: 17px;
          color: #b4bccf;
          line-height: 1.5;
        }

        /* Container */
        .bookings-container {
          padding: 10px 34px 70px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .bookings-wrapper {
          display: grid;
          gap: 24px;
        }

        /* Tabs */
        .tabs-section {
          display: flex;
          gap: 12px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .tab-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--color-text);
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.25s;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          color: #0b0f1f;
          border-color: transparent;
          box-shadow: 0 6px 16px -4px rgba(139, 92, 246, 0.4);
        }

        .tab-content {
          border-radius: var(--radius-lg);
          background: var(--panel-bg);
          border: 1px solid rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          padding: 24px;
        }

        /* Animations */
        .bookings-root .bookings-hero,
        .bookings-root .bookings-container {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }

        .bookings-root.animated .bookings-hero,
        .bookings-root.animated .bookings-container {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 0.72, 0.25, 1);
        }

        .bookings-root.animated .bookings-hero {
          transition-delay: 0.05s;
        }

        .bookings-root.animated .bookings-container {
          transition-delay: 0.18s;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .bookings-container {
            padding: 10px 22px 50px;
          }
        }

        @media (max-width: 640px) {
          .topbar {
            padding: 12px 18px;
          }
          .bookings-hero {
            padding: 60px 18px 30px;
          }
          .bookings-container {
            padding: 10px 18px 40px;
          }
          .links {
            gap: 12px;
          }
          .links a {
            font-size: 12px;
          }
          .welcome {
            display: none;
          }
          .tab-btn {
            padding: 8px 14px;
            font-size: 12px;
          }
          .tab-content {
            padding: 16px;
          }
        }

        @media (max-width: 460px) {
          .logo-text {
            display: none;
          }
          .links {
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
