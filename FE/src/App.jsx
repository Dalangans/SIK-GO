import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookings from './pages/Bookings';
import Proposals from './pages/Proposals';
import DocumentAnalysis from './pages/DocumentAnalysis';
import ProposalEvaluator from './components/ProposalEvaluator';

// Placeholder sederhana (bisa pindah ke file baru nanti)
const About = () => <div style={{padding:40}}>About Us Page (coming soon)</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/document-analysis" element={<DocumentAnalysis />} />
        <Route path="/evaluator" element={<ProposalEvaluator />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
