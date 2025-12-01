import React, { useState } from 'react';
import { bookingAPI, roomAPI } from '../services/api';

export default function BookingForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    roomId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    description: '',
    participantCount: 1,
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await roomAPI.getAllRooms();
      setRooms(data.data || []);
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'participantCount' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await bookingAPI.createBooking(formData);
      setSuccess('Booking berhasil dibuat! Tunggu persetujuan admin.');
      setFormData({
        roomId: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        description: '',
        participantCount: 1,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Gagal membuat booking');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!formData.roomId || !formData.startDate || !formData.startTime) {
      setError('Isi roomId, startDate, dan startTime terlebih dahulu');
      return;
    }

    try {
      const recommendations = await bookingAPI.getAIRecommendations({
        roomId: formData.roomId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        personCount: formData.participantCount,
      });
      setSuccess(`AI Recommendation: ${recommendations.data?.recommendation || 'N/A'}`);
    } catch (err) {
      setError('Error getting recommendations: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Pesan Ruangan</h2>
      
      {error && <div style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: 'green', padding: '10px', marginBottom: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Ruangan *</label>
          <select
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Pilih Ruangan</option>
            {rooms.map(room => (
              <option key={room._id} value={room._id}>
                {room.roomName} (Kapasitas: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Tanggal Mulai *</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Tanggal Selesai *</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>Waktu Mulai *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Waktu Selesai *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Tujuan *</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="Mis: Rapat, Kuliah, Seminar"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Deskripsi detail (opsional)"
            style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Jumlah Peserta *</label>
          <input
            type="number"
            name="participantCount"
            value={formData.participantCount}
            onChange={handleChange}
            min="1"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button
            type="button"
            onClick={handleGetRecommendations}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            💡 Dapatkan Rekomendasi AI
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Memproses...' : 'Buat Booking'}
        </button>
      </form>
    </div>
  );
}
