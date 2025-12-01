import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingAPI.getMyBookings();
      setBookings(data.data || []);
    } catch (err) {
      setError(err.message || 'Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus booking ini?')) return;

    try {
      await bookingAPI.deleteBooking(id);
      setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#FF9800',
      approved: '#4CAF50',
      rejected: '#F44336',
      completed: '#2196F3',
      cancelled: '#757575'
    };
    return (
      <span style={{
        backgroundColor: colors[status] || '#999',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h2>Daftar Booking Saya</h2>
      
      {error && <div style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}

      {bookings.length === 0 ? (
        <p>Belum ada booking.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Ruangan</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tanggal</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Waktu</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tujuan</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{booking.room?.roomName}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(booking.startDate).toLocaleDateString('id-ID')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td style={{ padding: '10px' }}>{booking.purpose}</td>
                  <td style={{ padding: '10px' }}>
                    {getStatusBadge(booking.status)}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => handleDelete(booking._id)}
                      style={{
                        backgroundColor: '#F44336',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={loadBookings}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Refresh
      </button>
    </div>
  );
}
