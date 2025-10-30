import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Add basic styles to body
document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.backgroundColor = 'cyan';

createRoot(document.getElementById('root')).render(<App />);