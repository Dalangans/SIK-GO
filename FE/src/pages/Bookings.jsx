import React, { useState } from 'react';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: '#1976D2', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>Manajemen Peminjaman Ruangan</h1>
      </div>

      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #ddd'
        }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'create' ? '#1976D2' : '#ccc',
              color: activeTab === 'create' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Buat Booking
          </button>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'list' ? '#1976D2' : '#ccc',
              color: activeTab === 'list' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Daftar Booking Saya
          </button>
        </div>

        {activeTab === 'create' && <BookingForm onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'list' && <BookingList />}
      </div>
    </div>
  );
}
