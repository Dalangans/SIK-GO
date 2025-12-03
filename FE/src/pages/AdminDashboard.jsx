import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProposalReviewModal from "../components/ProposalReviewModal";

// Helper function to group bookings by date
function getBookingsByDate(bookings) {
  const bookingsByDate = {};
  bookings.forEach((b) => {
    const d = new Date(b.startDate);
    const key = d.toISOString().slice(0, 10);
    if (!bookingsByDate[key]) bookingsByDate[key] = [];
    bookingsByDate[key].push(b);
  });
  return bookingsByDate;
}

// Enhanced Room Calendar Modal component
function RoomCalendarModal({ open, onClose, bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!open) return null;

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const bookingsByDate = getBookingsByDate(bookings);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const weeks = [];
  let day = 1 - firstDay;

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day < 1 || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
      }
    }
    weeks.push(week);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(10,12,30,0.95)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #181c2f 0%, #1f2844 100%)",
          borderRadius: 16,
          padding: 32,
          minWidth: 750,
          maxWidth: 1000,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          color: "#e6e9f5",
          position: "relative",
          border: "1px solid rgba(110, 231, 249, 0.1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
            fontSize: "18px",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.2)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.1)")
          }
        >
          ✕
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
            Room Availability Calendar
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handlePrevMonth}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(110, 231, 249, 0.15)",
                border: "1px solid rgba(110, 231, 249, 0.3)",
                color: "#6ee7f9",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(110, 231, 249, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(110, 231, 249, 0.15)";
              }}
            >
              ◀ Prev
            </button>
            <button
              onClick={handleToday}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "linear-gradient(90deg,#6ee7f9,#8b5cf6)",
                border: "none",
                color: "#0b0f1f",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.filter = "brightness(1.1);")}
              onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(110, 231, 249, 0.15)",
                border: "1px solid rgba(110, 231, 249, 0.3)",
                color: "#6ee7f9",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(110, 231, 249, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(110, 231, 249, 0.15)";
              }}
            >
              Next ▶
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#8b5cf6" }}>
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "none",
          }}
        >
          <thead>
            <tr style={{ color: "#8b5cf6", fontSize: "12px", fontWeight: 600 }}>
              <th style={{ padding: "12px 6px", textAlign: "center" }}>Sun</th>
              <th style={{ padding: "12px 6px", textAlign: "center" }}>Mon</th>
              <th style={{ padding: "12px 6px", textAlign: "center" }}>Tue</th>
              <th style={{ padding: "12px 6px", textAlign: "center" }}>Wed</th>
              <th style={{ padding: "12px 6px", textAlign: "center" }}>Thu</th>
              <th style={{ padding: "12px 6px", textAlign: "center" }}>Fri</th>
              <th style={{ padding: "12px 6px", textAlign: "center" }}>Sat</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((date, di) => {
                  const dateStr = date
                    ? `${currentYear}-${String(currentMonth + 1).padStart(
                        2,
                        "0"
                      )}-${String(date).padStart(2, "0")}`
                    : null;
                  const dayBookings = dateStr ? bookingsByDate[dateStr] || [] : [];
                  const isToday =
                    date &&
                    date === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear();

                  return (
                    <td
                      key={di}
                      style={{
                        verticalAlign: "top",
                        minWidth: 120,
                        height: 100,
                        border: "1px solid rgba(110, 231, 249, 0.1)",
                        background: date
                          ? isToday
                            ? "rgba(110, 231, 249, 0.15)"
                            : "rgba(30, 40, 70, 0.5)"
                          : "transparent",
                        borderRadius: 8,
                        padding: 8,
                        fontSize: "12px",
                        overflow: "hidden",
                      }}
                    >
                      {date && (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: 6,
                              color: isToday ? "#6ee7f9" : "#e6e9f5",
                              fontSize: "13px",
                            }}
                          >
                            {date}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              overflowY: "auto",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            {dayBookings.length > 0 ? (
                              dayBookings.map((b) => (
                                <div
                                  key={b._id}
                                  style={{
                                    fontSize: "10px",
                                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(110, 231, 249, 0.4))",
                                    borderRadius: 4,
                                    padding: "4px 6px",
                                    color: "#fff",
                                    borderLeft: "3px solid #6ee7f9",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: "1.2",
                                  }}
                                  title={`${b.room?.ruang || b.roomName} - ${b.startTime} to ${b.endTime}`}
                                >
                                  <strong>{b.room?.ruang || b.roomName}</strong>
                                  <div>{b.startTime} - {b.endTime}</div>
                                </div>
                              ))
                            ) : (
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "rgba(230, 233, 245, 0.4)",
                                  fontStyle: "italic",
                                }}
                              >
                                Available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: 16,
            padding: "12px",
            background: "rgba(110, 231, 249, 0.1)",
            borderRadius: 8,
            fontSize: "12px",
            color: "#b4bccf",
            borderLeft: "3px solid #8b5cf6",
          }}
        >
          <strong style={{ color: "#6ee7f9" }}>Legend:</strong> Each card shows
          the room name and time slot. Dates with no bookings are marked as
          "Available".
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("proposals");
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  // Modal states
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Room Calendar modal state
  const [showRoomCalendar, setShowRoomCalendar] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("sikgo_user") || "{}");
    if (userData.role !== "admin") {
      navigate("/login");
      return;
    }
    setUser(userData);
  }, [navigate]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === "proposals") {
        loadAllProposals();
      } else {
        loadAllBookings();
      }
    }
  }, [activeTab, user]);

  const loadAllProposals = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const envBase = import.meta.env.VITE_API_URL?.trim();
      const base =
        envBase && envBase !== ""
          ? envBase.replace(/\/+$/, "")
          : "http://localhost:3000";

      const res = await fetch(`${base}/api/proposals/admin/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setProposals(json.data || []);
      } else {
        setError(json.error || json.message || `Failed to load proposals`);
      }
    } catch (err) {
      setError(err.message || "Error loading proposals");
    } finally {
      setLoading(false);
    }
  };
  
  const loadAllBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const envBase = import.meta.env.VITE_API_URL?.trim();
      const base =
        envBase && envBase !== ""
          ? envBase.replace(/\/+$/, "")
          : "http://localhost:3000";

      const res = await fetch(`${base}/api/bookings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setBookings(json.data || []);
      } else {
        setError(json.error || json.message || `Failed to load bookings`);
      }
    } catch (err) {
      setError(err.message || "Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#f44336";
      case "pending":
        return "#ff9800";
      case "completed":
        return "#2196F3";
      default:
        return "#999";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("sikgo_user");
    navigate("/login", { replace: true });
  };

  const displayName = user
    ? user.fullName ||
      user.name ||
      (user.email ? user.email.split("@")[0].replace(/[._-]/g, " ") : "User")
    : "Guest";

  const filteredProposals = proposals.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const handleStatusChange = async (id, type, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      const envBase = import.meta.env.VITE_API_URL?.trim();
      const base =
        envBase && envBase !== ""
          ? envBase.replace(/\/+$/, "")
          : "http://localhost:3000";
      const endpoint =
        type === "proposal"
          ? `/api/proposals/${id}/status`
          : `/api/bookings/${id}`;

      const res = await fetch(`${base}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        if (type === "proposal") {
          setProposals(
            proposals.map((p) =>
              p._id === id ? { ...p, status: newStatus } : p
            )
          );
        } else {
          setBookings(
            bookings.map((b) =>
              b._id === id ? { ...b, status: newStatus } : b
            )
          );
        }
      } else {
        setError(json.error || "Failed to update");
      }
    } catch (err) {
      setError("Error updating");
    }
  };

  const handleOpenProposalReview = (proposal) => {
    setSelectedProposal(proposal);
    setShowModal(true);
  };

  const handleReviewSubmit = () => {
    setShowModal(false);
    setSelectedProposal(null);
    loadAllProposals();
  };

  return (
    <div className={`admin-root ${mounted ? "animated" : ""}`}>
      <nav className="topbar">
        <div className="logo">
          <img src="/Icon.svg" alt="Logo" className="logo-icon" />
          <span className="logo-text">SIK-GO Admin</span>
        </div>
        <div className="links">
          <span className="welcome">Welcome, {displayName}</span>
          <span className="role-badge">👤 {user?.role?.toUpperCase()}</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <header className="admin-hero">
        <h1>Admin Dashboard</h1>
        <p>Manage proposals and bookings</p>
      </header>

      <section className="admin-container">
        <div className="admin-wrapper">
          {error && (
            <div className="error-banner">
              <p>⚠ {error}</p>
              <button
                onClick={() => setError("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="tabs-section" style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setActiveTab("proposals");
                setFilter("all");
              }}
              className={`tab-btn ${activeTab === "proposals" ? "active" : ""}`}
            >
              Proposals
            </button>
            <button
              onClick={() => {
                setActiveTab("bookings");
                setFilter("all");
              }}
              className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
            >
              Bookings
            </button>
            <button
              onClick={() => setShowRoomCalendar(true)}
              style={{
                padding: "6px 18px",
                borderRadius: 12,
                background: "linear-gradient(90deg,#6ee7f9,#8b5cf6)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 2px 8px #0003",
                marginLeft: 8,
              }}
            >
              Room Calendar
            </button>
          </div>
          {/* Room Calendar Modal */}
          <RoomCalendarModal
            open={showRoomCalendar}
            onClose={() => setShowRoomCalendar(false)}
            bookings={bookings}
          />

          <div className="filter-bar">
            <label>Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              {activeTab === "bookings" && (
                <option value="completed">Completed</option>
              )}
              {activeTab === "bookings" && (
                <option value="cancelled">Cancelled</option>
              )}
            </select>
            <button
              onClick={() =>
                activeTab === "proposals"
                  ? loadAllProposals()
                  : loadAllBookings()
              }
              className="refresh-btn"
            >
              ↻ Refresh
            </button>
          </div>

          {loading && (
            <div className="loading-state">Loading {activeTab}...</div>
          )}

          {!loading && (
            <div className="data-grid">
              {activeTab === "proposals" ? (
                filteredProposals.length > 0 ? (
                  filteredProposals.map((proposal) => (
                    <div key={proposal._id} className="data-card">
                      <div className="card-header">
                        <div>
                          <h3>{proposal.title}</h3>
                          <p className="card-meta">
                            {proposal.user?.name || "Unknown"}
                          </p>
                        </div>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(proposal.status),
                          }}
                        >
                          {proposal.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="card-body">
                        <p>
                          <strong>Email:</strong>{" "}
                          {proposal.user?.email || "N/A"}
                        </p>
                        <p>
                          <strong>Description:</strong>{" "}
                          {proposal.description || "No description"}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={() => handleOpenProposalReview(proposal)}
                          className="action-btn review-btn"
                        >
                          📋 Review & Evaluate
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              proposal._id,
                              "proposal",
                              "approved"
                            )
                          }
                          disabled={proposal.status === "approved"}
                          className="action-btn approve-btn"
                          title="Quick Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              proposal._id,
                              "proposal",
                              "rejected"
                            )
                          }
                          disabled={proposal.status === "rejected"}
                          className="action-btn reject-btn"
                          title="Quick Reject"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No proposals found</div>
                )
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking._id} className="data-card">
                    <div className="card-header">
                      <div>
                        <h3>{booking.room?.ruang || "Unknown Room"}</h3>
                        <p className="card-meta">{booking.purpose}</p>
                      </div>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(booking.status),
                        }}
                      >
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="card-body">
                      <p>
                        <strong>User:</strong> {booking.user?.name || "Unknown"}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong> {booking.startTime} -{" "}
                        {booking.endTime}
                      </p>
                      <p>
                        <strong>Participants:</strong>{" "}
                        {booking.participantCount}
                      </p>
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() =>
                          handleStatusChange(booking._id, "booking", "approved")
                        }
                        disabled={booking.status === "approved"}
                        className="action-btn approve-btn"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(booking._id, "booking", "rejected")
                        }
                        disabled={booking.status === "rejected"}
                        className="action-btn reject-btn"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No bookings found</div>
              )}
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <ProposalReviewModal
          proposal={selectedProposal}
          onClose={() => {
            setShowModal(false);
            setSelectedProposal(null);
          }}
          onReviewSubmit={handleReviewSubmit}
        />
      )}

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
          font-family: var(--font-stack);
          -webkit-font-smoothing: antialiased;
          color: #e6e9f5;
          overscroll-behavior-x: none;
        }

        .admin-root {
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

        .admin-root::before,
        .admin-root::after {
          content: "";
          position: fixed;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .admin-root::before {
          top: -120px;
          right: -140px;
          background: var(--grad-accent-purple);
        }

        .admin-root::after {
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
          gap: 20px;
          position: relative;
          z-index: 1;
        }

        .welcome {
          font-size: 13px;
          font-weight: 500;
          color: #e6efff;
        }

        .role-badge {
          font-size: 13px;
          font-weight: 600;
          color: #6ee7f9;
          background: rgba(110, 231, 249, 0.1);
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(110, 231, 249, 0.2);
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
        .admin-hero {
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

        .admin-hero h1 {
          margin: 0;
          font-size: clamp(2.3rem, 5vw, 3.2rem);
          line-height: 1.25;
          background: linear-gradient(90deg, #fff, #b5c6ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        .admin-hero p {
          margin: 0;
          font-size: 17px;
          color: #b4bccf;
          line-height: 1.5;
        }

        /* Container */
        .admin-container {
          padding: 10px 34px 70px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .admin-wrapper {
          display: grid;
          gap: 24px;
        }

        .error-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 12px;
          color: #ff7675;
          font-weight: 500;
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
          font-family: var(--font-stack);
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

        /* Filter Bar */
        .filter-bar {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 15px 20px;
          background: var(--panel-bg);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .filter-bar label {
          color: var(--color-text);
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid rgba(110, 231, 249, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-text);
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          font-family: var(--font-stack);
          flex: 1;
          max-width: 200px;
        }

        .filter-select option {
          background: #0b0f1f;
          color: var(--color-text);
        }

        .refresh-btn {
          padding: 8px 14px;
          background: linear-gradient(135deg, #6ee7f9, #8b5cf6);
          color: #0b0f1f;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          font-family: var(--font-stack);
        }

        .refresh-btn:hover {
          filter: brightness(1.1);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }

        /* Data Grid */
        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .data-card {
          background: var(--panel-bg);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          gap: 15px;
          transition: all 0.3s ease;
        }

        .data-card:hover {
          border-color: rgba(110, 231, 249, 0.3);
          box-shadow: 0 8px 32px rgba(110, 231, 249, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .card-header h3 {
          margin: 0 0 6px 0;
          font-size: 16px;
          color: #fff;
          line-height: 1.3;
        }

        .card-meta {
          margin: 0;
          font-size: 12px;
          color: var(--color-text-dim);
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .card-body {
          display: grid;
          gap: 8px;
        }

        .card-body p {
          margin: 0;
          font-size: 12px;
          color: var(--color-text);
          line-height: 1.4;
        }

        .card-body strong {
          color: #6ee7f9;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          min-width: 80px;
          padding: 8px 10px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 11.5px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-stack);
        }

        .review-btn {
          flex: 1 1 100%;
          background: linear-gradient(135deg, #8b5cf6, #6ee7f9);
          color: #fff;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .review-btn:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }

        .approve-btn {
          background: rgba(76, 175, 80, 0.8);
          color: #fff;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .approve-btn:not(:disabled):hover {
          background: rgba(76, 175, 80, 1);
          box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
        }

        .reject-btn {
          background: rgba(244, 67, 54, 0.8);
          color: #fff;
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }

        .reject-btn:not(:disabled):hover {
          background: rgba(244, 67, 54, 1);
          box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-text-dim);
          font-size: 15px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: var(--color-text-dim);
          font-size: 15px;
        }

        /* Animations */
        .admin-root .admin-hero,
        .admin-root .admin-container {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }

        .admin-root.animated .admin-hero,
        .admin-root.animated .admin-container {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 0.72, 0.25, 1);
        }

        .admin-root.animated .admin-hero {
          transition-delay: 0.05s;
        }

        .admin-root.animated .admin-container {
          transition-delay: 0.18s;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .data-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
          .admin-container {
            padding: 10px 22px 50px;
          }
        }

        @media (max-width: 640px) {
          .topbar {
            padding: 12px 18px;
          }
          .admin-hero {
            padding: 60px 18px 30px;
          }
          .admin-container {
            padding: 10px 18px 40px;
          }
          .data-grid {
            grid-template-columns: 1fr;
          }
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-select {
            max-width: 100%;
          }
          .links {
            gap: 10px;
          }
          .card-actions {
            flex-direction: column;
          }
          .action-btn {
            width: 100%;
            min-width: auto;
          }
        }

        @media (max-width: 460px) {
          .logo-text {
            display: none;
          }
          .welcome {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
