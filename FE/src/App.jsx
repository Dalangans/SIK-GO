import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import ReserveRoom from './pages/ReserveRoom';
import Bookings from './pages/Bookings';
import Proposals from './pages/Proposals';
import DocumentAnalysis from './pages/DocumentAnalysis';
import AdminDashboard from './pages/AdminDashboard';

// Placeholder sederhana (bisa pindah ke file baru nanti)
const About = () => <div style={{padding:40}}>About Us Page (coming soon)</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/reserve-room" element={<ReserveRoom />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/document-analysis" element={<DocumentAnalysis />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
