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
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  filterSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee'
  },
  filterLabel: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '8px 12px',
    backgroundColor: '#1976D2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  bookingsList: {
    display: 'grid',
    gap: '15px'
  },
  bookingCard: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  cardTitle: {
    margin: 0
  },
  purpose: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#666'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cardBody: {
    fontSize: '14px',
    color: '#666',
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
    gap: '3px'
  },
  description: {
    padding: '8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    marginTop: '10px',
    fontSize: '13px'
  },
  notes: {
    padding: '8px',
    backgroundColor: '#fff3cd',
    borderRadius: '3px',
    marginTop: '10px',
    fontSize: '13px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
    fontSize: '14px'
  },
  errorState: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center'
  },
  retryBtn: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    fontSize: '14px'
  }
};
