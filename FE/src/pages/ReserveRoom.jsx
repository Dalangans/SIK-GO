import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingAPI, roomAPI } from '../services/api';

export default function ReserveRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomId, setRoomId] = useState(location.state?.roomId || '');
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectMode, setSelectMode] = useState(location.state?.selectMode || false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '10:00',
    purpose: '',
    description: '',
    kelas: '',
    participantCount: '1'
  });

  // Load user data
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

  // Animation trigger
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Load room data if roomId is provided
  useEffect(() => {
    if (roomId) {
      loadRoom();
    } else {
      setRoom(null);
    }
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading room with ID:', roomId);
      const res = await roomAPI.getRoomById(roomId);
      if (res.success) {
        console.log('Room loaded successfully:', res.data);
        setRoom(res.data);
      } else {
        console.error('Failed to load room:', res.error);
        setError(res.error || 'Failed to load room');
      }
    } catch (err) {
      console.error('Error loading room:', err);
      setError(err.message || 'Error loading room');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectRoom = async () => {
    navigate('/rooms', { state: { selectMode: true, returnTo: 'reserve' } });
  };

  const validateForm = () => {
    if (!roomId) {
      setError('Please select a room');
      return false;
    }
    if (!formData.startDate) {
      setError('Please select start date');
      return false;
    }
    if (!formData.endDate) {
      setError('Please select end date');
      return false;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date');
      return false;
    }
    if (!formData.startTime) {
      setError('Please select start time');
      return false;
    }
    if (!formData.endTime) {
      setError('Please select end time');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return false;
    }
    if (!formData.purpose.trim()) {
      setError('Please enter booking purpose');
      return false;
    }
    if (!formData.kelas.trim()) {
      setError('Please select or enter class/kelas');
      return false;
    }
    if (!formData.participantCount || parseInt(formData.participantCount) < 1) {
      setError('Please enter valid participant count');
      return false;
    }
    if (room && parseInt(formData.participantCount) > room.kapasitas) {
      setError(`Participant count cannot exceed room capacity of ${room.kapasitas}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      const bookingData = {
        roomId: roomId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        description: formData.description,
        kelas: formData.kelas,
        participantCount: parseInt(formData.participantCount)
      };

      console.log('Booking data being sent:', bookingData);

      const res = await bookingAPI.createBooking(bookingData);
      if (res.success) {
        setSuccessMessage('✓ Room reserved successfully! Your booking has been saved.');
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      } else {
        setError(res.error || 'Failed to create booking');
      }
    } catch (err) {
      setError(err.message || 'Error creating booking');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sikgo_user');
    navigate('/login', { replace: true });
  };

  const displayName = user
    ? (user.fullName || user.name || (user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'User'))
    : 'Guest';

  return (
    <div className={`reserve-root ${mounted ? 'animated' : ''}`}>
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

      <header className="reserve-hero">
        <h1>Reserve Room</h1>
        <p>Book a room for your meeting, class, or event</p>
      </header>

      <section className="reserve-container">
        <div className="reserve-wrapper">
          <form onSubmit={handleSubmit} className="reserve-form">
            {/* Room Selection */}
            <div className="form-section">
              <h2 className="section-title">1. Select Room</h2>
              {room ? (
                <div className="selected-room">
                  <div className="room-info">
                    <h3>{room.ruang}</h3>
                    <p>{room.gedung} - Capacity: {room.kapasitas} people</p>
                    {room.lokasi && <p>Location: {room.lokasi}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectRoom}
                    className="change-room-btn"
                  >
                    Change Room
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSelectRoom}
                  className="select-room-btn"
                >
                  + Select Room
                </button>
              )}
            </div>

            {/* Date and Time Section */}
            <div className="form-section">
              <h2 className="section-title">2. Date & Time</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Class Section */}
            <div className="form-section">
              <h2 className="section-title">3. Class</h2>

              <div className="form-group">
                <label className="form-label">Select or Enter Class *</label>
                <select
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">-- Select Class --</option>
                  <option value="2023-1">2023-1</option>
                  <option value="2023-2">2023-2</option>
                  <option value="2024-1">2024-1</option>
                  <option value="2024-2">2024-2</option>
                  <option value="2025-1">2025-1</option>
                  <option value="2025-2">2025-2</option>
                  <option value="other">Other...</option>
                </select>
              </div>

              {formData.kelas === 'other' && (
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter custom class"
                    value={formData.customKelas || ''}
                    onChange={(e) => setFormData({ ...formData, customKelas: e.target.value, kelas: e.target.value })}
                    className="form-input"
                  />
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="form-section">
              <h2 className="section-title">4. Booking Details</h2>

              <div className="form-group">
                <label className="form-label">Booking Purpose *</label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="E.g. Meeting, Class, Seminar"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional information (optional)"
                  className="form-input form-textarea"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Participant Count * 
                  {room && <span className="participant-max"> (Max: {room.kapasitas})</span>}
                </label>
                <input
                  type="number"
                  name="participantCount"
                  value={formData.participantCount}
                  onChange={handleInputChange}
                  min="1"
                  max={room ? room.kapasitas : undefined}
                  placeholder={`Enter number of participants (1-${room ? room.kapasitas : '?'})`}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="error-message">
                <strong>⚠ Error:</strong> {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                <strong>✓ Success:</strong> {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="form-section form-actions-section">
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={submitLoading || loading}
                  className="submit-btn"
                >
                  {submitLoading ? '⏳ Saving...' : '💾 Save Reservation'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div style={{ height: '75px' }}></div>
          </form>

          {/* Info Panel */}
          <div className="info-panel">
            <h3 className="info-title">Important Information</h3>
            <ul className="info-list">
              <li>Reservations must be made at least 1 day in advance</li>
              <li>Maximum reservation duration is 4 hours per day</li>
              <li>Ensure selected class matches academic schedule</li>
              <li>Confirmation will be sent to your email</li>
              <li>For cancellation, contact admin 24 hours before</li>
            </ul>
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
          --font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
        }

        body {
          background: var(--grad-main);
          scrollbar-width: thin;
          scrollbar-color: rgba(110, 231, 249, 0.5) rgba(30, 40, 60, 0.3);
        }

        body::-webkit-scrollbar {
          width: 10px;
        }

        body::-webkit-scrollbar-track {
          background: rgba(30, 40, 60, 0.3);
        }

        body::-webkit-scrollbar-thumb {
          background: rgba(110, 231, 249, 0.5);
          border-radius: 5px;
        }

        body::-webkit-scrollbar-thumb:hover {
          background: rgba(110, 231, 249, 0.8);
        }

        .reserve-root {
          background: var(--grad-main);
          color: var(--color-text);
          font-family: var(--font-stack);
          min-height: 100vh;
          width: 100%;
          padding-top: 60px;
          padding-bottom: 700px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: rgba(110, 231, 249, 0.5) rgba(30, 40, 60, 0.3);
        }

        .reserve-root::-webkit-scrollbar {
          width: 10px;
        }

        .reserve-root::-webkit-scrollbar-track {
          background: rgba(30, 40, 60, 0.3);
        }

        .reserve-root::-webkit-scrollbar-thumb {
          background: rgba(110, 231, 249, 0.5);
          border-radius: 5px;
        }

        .reserve-root::-webkit-scrollbar-thumb:hover {
          background: rgba(110, 231, 249, 0.8);
        }

        .reserve-root::before,
        .reserve-root::after {
          content: "";
          position: fixed;
          width: 1000px;
          height: 1000px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .reserve-root::before {
          top: -200px;
          right: -200px;
          background: radial-gradient(circle at 20% 30%, #6ee7f955, transparent 50%);
          filter: blur(70px);
          opacity: 0.35;
        }

        .reserve-root::after {
          bottom: -200px;
          left: -200px;
          background: radial-gradient(circle at 80% 20%, #8b5cf655, transparent 50%);
          filter: blur(70px);
          opacity: 0.35;
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
          font-family: var(--font-stack);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-stack);
        }

        .logo-icon {
          width: 36px;
          height: 36px;
        }

        .logo-text {
          font-family: var(--font-stack);
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
          font-family: var(--font-stack);
        }

        .links a {
          font-family: var(--font-stack);
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
          font-family: var(--font-stack);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.3px;
          color: #e6efff;
        }

        .logout-btn {
          font-family: var(--font-stack);
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
        .reserve-hero {
          font-family: var(--font-stack);
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

        .reserve-hero h1 {
          font-family: var(--font-stack);
          margin: 0;
          font-size: clamp(2.3rem, 5vw, 3.2rem);
          line-height: 1.25;
          background: linear-gradient(90deg, #fff, #b5c6ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        .reserve-hero p {
          font-family: var(--font-stack);
          margin: 0;
          font-size: 17px;
          color: #b4bccf;
          line-height: 1.5;
        }

        /* Container */
        .reserve-container {
          font-family: var(--font-stack);
          padding: 10px 34px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .reserve-wrapper {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 30px;
        }

        .reserve-form {
          font-family: var(--font-stack);
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .form-section {
          font-family: var(--font-stack);
          padding: 24px;
          border-radius: var(--radius-lg);
          background: var(--panel-bg);
          border: 1px solid rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          margin-bottom: 20px;
        }

        .form-section:last-of-type {
          margin-bottom: 0;
        }

        .form-actions-section {
          position: sticky;
          top: 60px;
          margin-top: 30px !important;
          background: linear-gradient(170deg, rgba(110, 231, 249, 0.05), rgba(139, 92, 246, 0.05)) !important;
          border: 1px solid rgba(110, 231, 249, 0.1) !important;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .section-title {
          font-family: var(--font-stack);
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: grid;
          gap: 8px;
          margin-bottom: 24px;
        }

        .form-label {
          font-family: var(--font-stack);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          color: var(--color-text-dim);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .participant-max {
          font-size: 11px;
          color: #6ee7f9;
          text-transform: none;
          font-weight: 500;
          letter-spacing: 0px;
        }

        .form-input {
          font-family: var(--font-stack);
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: #e6e9f5;
          font-size: 13px;
          transition: 0.25s;
        }

        .form-input:hover {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(255, 255, 255, 0.12);
        }

        .form-input:focus {
          outline: none;
          border-color: #6ee7f9;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 12px rgba(110, 231, 249, 0.2);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .selected-room {
          font-family: var(--font-stack);
          background: rgba(110, 231, 249, 0.1);
          padding: 16px;
          border-radius: 10px;
          border: 2px solid rgba(110, 231, 249, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .room-info {
          flex: 1;
        }

        .room-info h3 {
          font-family: var(--font-stack);
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }

        .room-info p {
          font-family: var(--font-stack);
          margin: 3px 0;
          font-size: 13px;
          color: var(--color-text);
        }

        .select-room-btn,
        .change-room-btn {
          font-family: var(--font-stack);
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          color: #0b0f1f;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 6px 16px -4px rgba(139, 92, 246, 0.4);
          white-space: nowrap;
        }

        .select-room-btn:hover,
        .change-room-btn:hover {
          filter: brightness(1.05);
          box-shadow: 0 8px 20px -4px rgba(139, 92, 246, 0.5);
        }

        .select-room-btn {
          width: 100%;
        }

        .error-message {
          font-family: var(--font-stack);
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 10px;
          border-left: 4px solid #ef4444;
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(10px);
          animation: slideIn 0.3s ease;
        }

        .success-message {
          font-family: var(--font-stack);
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 10px;
          border-left: 4px solid #10b981;
          background: rgba(16, 185, 129, 0.15);
          color: #86efac;
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(10px);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }

        .submit-btn,
        .cancel-btn {
          font-family: var(--font-stack);
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s;
        }

        .submit-btn {
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          color: #0b0f1f;
          box-shadow: 0 6px 16px -4px rgba(139, 92, 246, 0.4);
        }

        .submit-btn:hover:not(:disabled) {
          filter: brightness(1.05);
          box-shadow: 0 8px 20px -4px rgba(139, 92, 246, 0.5);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #e6e9f5;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .info-panel {
          font-family: var(--font-stack);
          border-radius: var(--radius-lg);
          background: var(--panel-bg);
          border: 1px solid rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          padding: 24px;
          height: fit-content;
          position: relative;
          top: auto;
        }

        .info-title {
          font-family: var(--font-stack);
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 700;
          background: var(--grad-link);
          -webkit-background-clip: text;
          color: transparent;
        }

        .info-list {
          font-family: var(--font-stack);
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .info-list li {
          font-family: var(--font-stack);
          font-size: 12px;
          color: var(--color-text-dim);
          line-height: 1.6;
          padding-left: 16px;
          position: relative;
        }

        .info-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #6ee7f9;
          font-weight: bold;
        }

        /* Animations */
        .reserve-root .reserve-hero,
        .reserve-root .reserve-container {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }

        .reserve-root.animated .reserve-hero,
        .reserve-root.animated .reserve-container {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 0.72, 0.25, 1);
        }

        .reserve-root.animated .reserve-hero {
          transition-delay: 0.05s;
        }

        .reserve-root.animated .reserve-container {
          transition-delay: 0.18s;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .reserve-root {
            padding-top: 60px;
            padding-bottom: 150px;
          }
          .reserve-container {
            padding: 10px 22px;
          }
          .reserve-wrapper {
            grid-template-columns: 1fr;
          }
          .info-panel {
            position: static;
            top: auto;
          }
        }

        @media (max-width: 640px) {
          .reserve-root {
            padding-top: 50px;
            padding-bottom: 150px;
          }
          .topbar {
            padding: 12px 18px;
          }
          .reserve-hero {
            padding: 60px 18px 30px;
          }
          .reserve-container {
            padding: 10px 18px;
          }
          .form-section {
            padding: 16px;
          }
          .form-grid {
            grid-template-columns: 1fr;
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
          .form-actions {
            grid-template-columns: 1fr;
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
