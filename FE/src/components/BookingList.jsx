import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await bookingAPI.getMyBookings();
      if (res.success) {
        setBookings(res.data || []);
      } else {
        setError(res.error || 'Failed to load bookings');
      }
    } catch (err) {
      setError(err.message || 'Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const res = await bookingAPI.deleteBooking(id);
      if (res.success) {
        setBookings(bookings.filter(b => b._id !== id));
      } else {
        setError(res.error || 'Failed to delete booking');
      }
    } catch (err) {
      setError(err.message || 'Error deleting booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#757575';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div style={styles.container}>
      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>Filter by Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={loadBookings} style={styles.refreshBtn}>
          ↻ Refresh
        </button>
      </div>

      {loading && <div style={styles.loadingState}>Loading bookings...</div>}

      {error && !loading && (
        <div style={styles.errorState}>
          <p>⚠ {error}</p>
          <button onClick={loadBookings} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredBookings.length > 0 ? (
            <div style={styles.bookingsList}>
              {filteredBookings.map((booking) => (
                <div key={booking._id} style={styles.bookingCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>
                      <h3>{booking.room?.ruang || 'Unknown Room'}</h3>
                      <p style={styles.purpose}>{booking.purpose}</p>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(booking.status)
                      }}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.bookingInfo}>
                      <div style={styles.infoItem}>
                        <strong>Date:</strong>
                        <span>
                          {new Date(booking.startDate).toLocaleDateString()} to{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <strong>Time:</strong>
                        <span>{booking.startTime} - {booking.endTime}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <strong>Class:</strong>
                        <span>{booking.kelas || '-'}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <strong>Participants:</strong>
                        <span>{booking.participantCount}</span>
                      </div>
                    </div>

                    {booking.description && (
                      <div style={styles.description}>
                        <strong>Description:</strong> {booking.description}
                      </div>
                    )}

                    {booking.approvalNotes && (
                      <div style={styles.notes}>
                        <strong>Notes:</strong> {booking.approvalNotes}
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(booking._id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <button
                        onClick={() => handleDelete(booking._id)}
                        style={styles.deleteBtn}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>No bookings found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'transparent',
    padding: '20px',
    borderRadius: '8px',
  },
  filterSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  filterLabel: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#cfd6e4'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid rgba(110, 231, 249, 0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#cfd6e4',
    fontFamily: 'inherit'
  },
  refreshBtn: {
    padding: '8px 12px',
    backgroundColor: 'linear-gradient(135deg, #6ee7f9, #8b5cf6)',
    color: '#0b0f1f',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: '0 6px 16px -4px rgba(139, 92, 246, 0.4)'
  },
  bookingsList: {
    display: 'grid',
    gap: '15px'
  },
  bookingCard: {
    border: '1px solid rgba(110, 231, 249, 0.15)',
    borderRadius: '16px',
    padding: '20px',
    backgroundColor: 'linear-gradient(170deg, rgba(110, 231, 249, 0.05), rgba(139, 92, 246, 0.05))',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '10px'
  },
  cardTitle: {
    margin: 0,
    color: '#fff'
  },
  purpose: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#b4bccf'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  },
  cardBody: {
    fontSize: '14px',
    color: '#cfd6e4',
    marginBottom: '15px'
  },
  bookingInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '10px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    color: '#cfd6e4',
    fontSize: '13px'
  },
  description: {
    padding: '12px',
    backgroundColor: 'rgba(110, 231, 249, 0.08)',
    borderRadius: '8px',
    marginTop: '10px',
    fontSize: '13px',
    color: '#b4bccf',
    border: '1px solid rgba(110, 231, 249, 0.1)'
  },
  notes: {
    padding: '12px',
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderRadius: '8px',
    marginTop: '10px',
    fontSize: '13px',
    color: '#ffd700',
    border: '1px solid rgba(255, 193, 7, 0.2)'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#97a2b8',
    fontSize: '14px'
  },
  errorState: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid rgba(244, 67, 54, 0.4)',
    color: '#ff7675',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  retryBtn: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#97a2b8',
    fontSize: '14px'
  }
};
