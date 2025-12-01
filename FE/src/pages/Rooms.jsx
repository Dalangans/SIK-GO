import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomAPI } from '../services/api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('room'); // 'room', 'capacity'
  const [user, setUser] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
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
        if (res.ok && json.success) {
          setUser(json.data);
          localStorage.setItem('sikgo_user', JSON.stringify({
            id: json.data._id,
            email: json.data.email,
            name: json.data.name,
            role: json.data.role,
            fullName: json.data.name
          }));
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('sikgo_user');
        }
      } catch {
        // Network error, silently continue
      } finally {
        setFetching(false);
      }
    })();
  }, [navigate]);

  // Animation trigger
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Load rooms
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await roomAPI.getAllRooms();
      if (res.success) {
        setRooms(res.data || []);
        filterAndSortRooms(res.data || []);
      } else {
        setError(res.error || 'Failed to load rooms');
      }
    } catch (err) {
      setError(err.message || 'Error loading rooms');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRooms = (roomList) => {
    let filtered = roomList;

    // Filter by building
    if (selectedBuilding !== 'all') {
      filtered = filtered.filter(r => r.gedung === selectedBuilding);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.ruang.toLowerCase().includes(query) || 
        (r.deskripsi && r.deskripsi.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === 'capacity') {
      filtered.sort((a, b) => b.kapasitas - a.kapasitas);
    } else {
      filtered.sort((a, b) => a.ruang.localeCompare(b.ruang));
    }

    setFilteredRooms(filtered);
  };

  // Update filtered rooms when filters change
  useEffect(() => {
    filterAndSortRooms(rooms);
  }, [selectedBuilding, searchQuery, sortBy, rooms]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sikgo_user');
    navigate('/login', { replace: true });
  };

  const displayName = user
    ? (user.fullName || user.name || (user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'User'))
    : 'Guest';

  const getBuildings = () => {
    const buildings = [...new Set(rooms.map(r => r.gedung))].sort();
    return buildings;
  };

  const getBuildingLabel = (gedung) => {
    const labels = {
      'K': 'Gedung K',
      'S': 'Gedung S',
      'GK': 'Gedung GK',
      'Area Lain': 'Area Lain'
    };
    return labels[gedung] || gedung;
  };

  return (
    <div className={`rooms-root ${mounted ? 'animated' : ''}`}>
      <nav className="topbar fixed-top">
        <div className="logo">
          <img src="/Icon.svg" alt="Logo" className="logo-icon" />
          <span className="logo-text">SIK-GO</span>
        </div>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/rooms" className="active">Rooms</Link>
          {!user && <Link to="/login" className="login-btn">Log In</Link>}
          {user && (
            <>
              <span className="welcome">Welcome back, {displayName}</span>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <header className="rooms-hero">
        <h1>Room Availability</h1>
        <p>Check and reserve available rooms at FT UI</p>
      </header>

      <section className="rooms-container">
        <div className="rooms-wrapper">
          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Building</label>
              <select 
                value={selectedBuilding} 
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Buildings</option>
                {getBuildings().map(b => (
                  <option key={b} value={b}>{getBuildingLabel(b)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search room name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="room">Room Name</option>
                <option value="capacity">Capacity (High to Low)</option>
              </select>
            </div>

            <button onClick={loadRooms} className="refresh-btn">
              ↻ Refresh
            </button>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <p>Found <strong>{filteredRooms.length}</strong> room{filteredRooms.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading rooms...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state">
              <p>⚠ {error}</p>
              <button onClick={loadRooms} className="retry-btn">Retry</button>
            </div>
          )}

          {/* Rooms Grid */}
          {!loading && !error && (
            <>
              {filteredRooms.length > 0 ? (
                <div className="rooms-grid">
                  {filteredRooms.map((room) => (
                    <div key={room._id || room.ruang} className="room-card">
                      <div className="room-header">
                        <div className="room-title">
                          <h3>{room.ruang}</h3>
                          <span className="building-badge">{getBuildingLabel(room.gedung)}</span>
                        </div>
                        <div className={`status-badge ${room.status || 'tersedia'}`}>
                          {room.status === 'tersedia' ? '✓ Available' : 
                           room.status === 'tidak tersedia' ? '✗ Unavailable' : 
                           '⚙ Maintenance'}
                        </div>
                      </div>

                      <div className="room-body">
                        <div className="room-info">
                          <div className="info-item">
                            <span className="info-label">Capacity</span>
                            <span className="info-value">{room.kapasitas} seats</span>
                          </div>
                          {room.lokasi && (
                            <div className="info-item">
                              <span className="info-label">Location</span>
                              <span className="info-value">{room.lokasi}</span>
                            </div>
                          )}
                        </div>

                        {room.deskripsi && (
                          <p className="room-description">{room.deskripsi}</p>
                        )}

                        {room.fasilitas && room.fasilitas.length > 0 && (
                          <div className="facilities">
                            <label>Facilities</label>
                            <div className="facilities-list">
                              {room.fasilitas.map((f, idx) => (
                                <span key={idx} className="facility-tag">{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {user && (
                        <div className="room-actions">
                          <button className="reserve-btn">
                            Reserve Room
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No rooms found matching your criteria</p>
                  <button onClick={() => {
                    setSelectedBuilding('all');
                    setSearchQuery('');
                  }} className="reset-filters-btn">
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
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

        html,body,#root,.rooms-root { max-width:100vw; overflow-x:hidden; }
        html,body,#root { margin:0; padding:0; }
        body {
          background: var(--grad-main), var(--grad-accent-purple), var(--grad-accent-deep), linear-gradient(180deg, rgba(67,27,87,.10), rgba(14,20,38,.10));
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue";
          -webkit-font-smoothing: antialiased;
          color:#e6e9f5;
          overscroll-behavior-x:none;
        }

        .rooms-root { padding-top:86px; }
        .rooms-root::before,
        .rooms-root::after {
          content:""; position:fixed; inset:auto; pointer-events:none; width:520px; height:520px;
          border-radius:50%; filter:blur(120px); opacity:.22; z-index:0;
        }
        .rooms-root::before { top:-120px; right:-140px; background:radial-gradient(closest-side, rgba(95,43,122,.6), rgba(95,43,122,0)); }
        .rooms-root::after { bottom:-140px; left:-180px; background:radial-gradient(closest-side, rgba(50,22,75,.55), rgba(50,22,75,0)); }

        /* Topbar */
        .topbar {
          position:fixed; top:0; left:0; right:0;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 34px; backdrop-filter:blur(12px);
          background:rgba(0, 0, 0, 0.08);
          z-index:100;
        }
        .logo { display:flex; align-items:center; gap:12px; }
        .logo-icon { width:36px; height:36px; }
        .logo-text { font-weight:700; font-size:18px; letter-spacing:.5px; background:var(--grad-link); -webkit-background-clip:text; color:transparent; }
        .links { display:flex; align-items:center; gap:24px; position:relative; z-index:1; }
        .links a {
          font-size:13.5px; font-weight:600; letter-spacing:.25px;
          color:var(--color-text); text-decoration:none; position:relative; padding:4px 4px;
          transition:color .25s;
        }
        .links a.active { color:#6ee7f9; }
        .links a::after {
          content:""; position:absolute; left:10%; right:10%; bottom:0; height:2px;
          background:var(--grad-link); border-radius:2px; transform:scaleX(0); transform-origin:left;
          transition:transform .35s cubic-bezier(.16,.72,.25,1);
        }
        .links a:hover::after,.links a.active::after { transform:scaleX(1); }
        .login-btn {
          font-size:13.5px; font-weight:600; letter-spacing:.3px;
          display:inline-flex; align-items:center; padding:8px 16px; border-radius:999px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          box-shadow:0 6px 20px -4px rgba(139,92,246,.45); text-decoration:none;
          transition:transform .15s, box-shadow .3s, filter .25s;
        }
        .login-btn:hover { transform:translateY(-2px); box-shadow:0 10px 26px -4px rgba(139,92,246,.55); }
        .welcome { font-size:13px; font-weight:500; letter-spacing:.3px; color:#e6efff; }
        .logout-btn {
          padding:8px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.16);
          background:rgba(255,255,255,.06); color:#e8eef8; font-weight:600; cursor:pointer;
          transition:background .25s;
        }
        .logout-btn:hover { background:rgba(255,255,255,.12); }

        /* Hero */
        .rooms-hero {
          padding:80px 34px 40px; max-width:680px; margin:0 auto;
          display:grid; gap:22px; text-align:center; justify-items:center;
          position:relative; z-index:1;
        }
        .rooms-hero h1 {
          margin:0; font-size:clamp(2.3rem,5vw,3.2rem); line-height:1.25;
          background:linear-gradient(90deg,#fff,#b5c6ff); -webkit-background-clip:text; color:transparent;
        }
        .rooms-hero p { margin:0; font-size:17px; color:#b4bccf; line-height:1.5; }

        /* Container */
        .rooms-container { padding:10px 34px 70px; max-width:1200px; margin:0 auto; width:100%; position:relative; z-index:1; }
        .rooms-wrapper { display:grid; gap:24px; }

        /* Filters */
        .filters-section {
          display:grid; gap:16px; padding:24px;
          border-radius:var(--radius-lg); background:var(--panel-bg); 
          border:1px solid rgba(255,255,255,.02); backdrop-filter:blur(10px);
          grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          align-items:flex-end;
        }

        .filter-group {
          display:grid; gap:6px;
        }
        .filter-group label {
          font-size:12px; font-weight:600; letter-spacing:.3px;
          color:var(--color-text-dim); text-transform:uppercase;
        }
        .filter-select,.filter-input {
          padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.18);
          background:rgba(255,255,255,.08); color:#e6e9f5; font-size:13px;
          transition:.25s;
        }
        .filter-select:hover,.filter-input:hover { border-color:rgba(139,92,246,.5); background:rgba(255,255,255,.12); }
        .filter-select:focus,.filter-input:focus {
          outline:none; border-color:#6ee7f9; background:rgba(255,255,255,.15);
          box-shadow:0 0 12px rgba(110,231,249,.2);
        }

        .refresh-btn {
          padding:10px 16px; border:none; border-radius:10px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          font-weight:600; font-size:13px; cursor:pointer; transition:.2s;
          box-shadow:0 6px 16px -4px rgba(139,92,246,.4);
        }
        .refresh-btn:hover { filter:brightness(1.05); box-shadow:0 8px 20px -4px rgba(139,92,246,.5); }

        /* Results Info */
        .results-info {
          font-size:14px; color:var(--color-text-dim); padding:0 4px;
        }
        .results-info strong { color:#e6e9f5; font-weight:600; }

        /* Loading State */
        .loading-state {
          display:grid; gap:16px; place-items:center; padding:60px 20px;
          text-align:center;
        }
        .spinner {
          width:40px; height:40px; border-radius:50%;
          border:3px solid rgba(255,255,255,.2); border-top-color:#6ee7f9;
          animation:spin .8s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* Error State */
        .error-state {
          padding:20px; border-radius:12px; border-left:3px solid #ef4444;
          background:rgba(239,68,68,.1); color:#fca5a5; text-align:center;
          display:grid; gap:12px;
        }
        .retry-btn {
          padding:8px 16px; border:none; border-radius:8px;
          background:rgba(239,68,68,.2); color:#fca5a5;
          font-weight:600; cursor:pointer; transition:.2s;
        }
        .retry-btn:hover { background:rgba(239,68,68,.3); }

        /* Rooms Grid */
        .rooms-grid {
          display:grid; gap:20px;
          grid-template-columns:repeat(auto-fill,minmax(340px,1fr));
        }

        .room-card {
          display:grid; gap:16px; padding:20px; border-radius:var(--radius-lg);
          background:var(--panel-bg); border:1px solid rgba(255,255,255,.02);
          backdrop-filter:blur(10px); transition:.3s;
        }
        .room-card:hover {
          border-color:rgba(139,92,246,.4); background:linear-gradient(170deg,rgba(255,255,255,.12),rgba(255,255,255,.05));
          transform:translateY(-4px);
        }

        .room-header {
          display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
        }
        .room-title { display:grid; gap:6px; }
        .room-title h3 { margin:0; font-size:18px; font-weight:700; color:#fff; }
        .building-badge {
          font-size:11px; font-weight:600; letter-spacing:.2px;
          padding:4px 8px; border-radius:6px; background:rgba(110,231,249,.15);
          color:#6ee7f9; width:fit-content;
        }

        .status-badge {
          padding:6px 10px; border-radius:8px; font-size:12px; font-weight:600;
          letter-spacing:.2px; white-space:nowrap;
        }
        .status-badge.tersedia {
          background:rgba(16,185,129,.2); color:#6ee7b5;
        }
        .status-badge.tidak\ tersedia {
          background:rgba(239,68,68,.2); color:#fca5a5;
        }
        .status-badge.maintenance {
          background:rgba(245,158,11,.2); color:#fbbf24;
        }

        .room-body { display:grid; gap:14px; }
        .room-info { display:grid; gap:10px; }
        .info-item {
          display:flex; justify-content:space-between; align-items:center;
          padding:8px 0; border-bottom:1px solid rgba(255,255,255,.08);
        }
        .info-label { font-size:12px; color:var(--color-text-dim); font-weight:600; }
        .info-value { font-size:13px; color:#e6e9f5; font-weight:600; }

        .room-description {
          margin:0; font-size:13px; line-height:1.5; color:var(--color-text);
          padding:8px 0;
        }

        .facilities {
          display:grid; gap:8px;
        }
        .facilities > :first-child {
          font-size:12px; color:var(--color-text-dim); font-weight:600; margin:0;
        }
        .facilities-list {
          display:flex; flex-wrap:wrap; gap:6px;
        }
        .facility-tag {
          font-size:11px; padding:4px 8px; border-radius:6px;
          background:rgba(255,255,255,.08); color:#dce6f3;
          border:1px solid rgba(255,255,255,.12);
        }

        .room-actions { display:grid; gap:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,.08); }
        .reserve-btn {
          padding:10px 14px; border:none; border-radius:10px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          font-weight:600; font-size:13px; cursor:pointer; transition:.2s;
          box-shadow:0 6px 16px -4px rgba(139,92,246,.4);
        }
        .reserve-btn:hover { filter:brightness(1.05); box-shadow:0 8px 20px -4px rgba(139,92,246,.5); }

        /* Empty State */
        .empty-state {
          text-align:center; padding:60px 20px;
          display:grid; gap:16px; place-items:center;
        }
        .empty-state p { margin:0; font-size:16px; color:var(--color-text); }
        .reset-filters-btn {
          padding:10px 16px; border:none; border-radius:10px;
          background:linear-gradient(135deg,#6ee7f9,#8b5cf6); color:#0b0f1f;
          font-weight:600; font-size:13px; cursor:pointer; transition:.2s;
        }
        .reset-filters-btn:hover { filter:brightness(1.05); }

        /* Animations */
        .rooms-root .rooms-hero,.rooms-root .rooms-container {
          opacity:0; transform:translateY(20px) scale(.97);
        }
        .rooms-root.animated .rooms-hero,
        .rooms-root.animated .rooms-container {
          opacity:1; transform:translateY(0) scale(1);
          transition:opacity .7s ease, transform .7s cubic-bezier(.16,.72,.25,1);
        }
        .rooms-root.animated .rooms-hero { transition-delay:.05s; }
        .rooms-root.animated .rooms-container { transition-delay:.18s; }

        /* Responsive */
        @media (max-width:960px) {
          .rooms-container { padding:10px 22px 50px; }
          .filters-section { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:640px) {
          .topbar { padding:12px 18px; }
          .rooms-hero { padding:60px 18px 30px; }
          .rooms-container { padding:10px 18px 40px; }
          .filters-section { grid-template-columns:1fr; }
          .rooms-grid { grid-template-columns:1fr; }
          .links { gap:12px; }
          .links a { font-size:12px; }
          .welcome { display:none; }
          .room-card { padding:16px; }
        }
        @media (max-width:460px) {
          .logo-text { display:none; }
          .links { gap:10px; }
        }
      `}</style>
    </div>
  );
}
