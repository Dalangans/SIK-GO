import React, { useState } from 'react';
import ProposalForm from '../components/ProposalForm';
import ProposalList from '../components/ProposalList';

export default function Proposals() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>Manajemen Proposal</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
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
              backgroundColor: activeTab === 'create' ? '#4CAF50' : '#ccc',
              color: activeTab === 'create' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Buat Proposal
          </button>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'list' ? '#4CAF50' : '#ccc',
              color: activeTab === 'list' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Daftar Proposal
          </button>
        </div>

        {activeTab === 'create' && <ProposalForm onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'list' && <ProposalList />}
      </div>
    </div>
  );
}
