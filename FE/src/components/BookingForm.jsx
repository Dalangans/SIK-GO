import React, { useState, useEffect } from 'react';
import { bookingAPI, roomAPI } from '../services/api';

export default function BookingForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    roomId: '',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '10:00',
    purpose: '',
    description: '',
    kelas: '',
    participantCount: '1'
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load rooms on component mount
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setRoomsLoading(true);
      const res = await roomAPI.getAllRooms();
      if (res.success) {
        setRooms(res.data || []);
      } else {
        setError(res.error || 'Failed to load rooms');
      }
    } catch (err) {
      setError(err.message || 'Error loading rooms');
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!formData.roomId) {
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
      setError('Please select or enter class');
      return false;
    }
    if (!formData.participantCount || parseInt(formData.participantCount) < 1) {
      setError('Please enter valid participant count');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        roomId: formData.roomId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        description: formData.description,
        kelas: formData.kelas,
        participantCount: parseInt(formData.participantCount)
      };

      const res = await bookingAPI.createBooking(bookingData);
      if (res.success) {
        setSuccess('Booking created successfully!');
        setFormData({
          roomId: '',
          startDate: '',
          endDate: '',
          startTime: '08:00',
          endTime: '10:00',
          purpose: '',
          description: '',
          kelas: '',
          participantCount: '1'
        });
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to create booking');
      }
    } catch (err) {
      setError(err.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Room *</label>
          {roomsLoading ? (
            <p>Loading rooms...</p>
          ) : (
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleInputChange}
              style={styles.input}
              required
            >
              <option value="">-- Select Room --</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>
                  {room.ruang} - {room.gedung} (Capacity: {room.kapasitas})
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>End Time *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Class/Kelas *</label>
          <select
            name="kelas"
            value={formData.kelas}
            onChange={handleInputChange}
            style={styles.input}
            required
          >
            <option value="">-- Select Class --</option>
            <option value="2023-1">2023-1</option>
            <option value="2023-2">2023-2</option>
            <option value="2024-1">2024-1</option>
            <option value="2024-2">2024-2</option>
            <option value="2025-1">2025-1</option>
            <option value="2025-2">2025-2</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Purpose *</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            placeholder="e.g. Meeting, Class, Seminar"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Additional information (optional)"
            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            rows={3}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Participant Count *</label>
          <input
            type="number"
            name="participantCount"
            value={formData.participantCount}
            onChange={handleInputChange}
            min="1"
            style={styles.input}
            required
          />
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}
        {success && <div style={styles.successMessage}>{success}</div>}

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Creating...' : 'Create Booking'}
        </button>
      </form>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box'
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#1976D2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px'
  },
  successMessage: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #66bb6a',
    color: '#2e7d32',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px'
  }
};
