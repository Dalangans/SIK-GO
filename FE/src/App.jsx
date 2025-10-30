import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuIcon from './components/MenuIcon';
import Sidebar from './components/Sidebar';
import AboutUs from './pages/AboutUs';
import Home from './pages/Home';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <MenuIcon onClick={() => setIsSidebarOpen(!isSidebarOpen)} isOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
