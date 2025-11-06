const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./src/route/authRoutes');
const userRoutes = require('./src/route/userRoutes');
const roomRoutes = require('./src/route/roomRoutes');
const proposalRoutes = require('./src/route/proposalRoutes');
const sikDocumentRoutes = require('./src/route/sikDocumentRoutes');
const { connectDB } = require('./src/database/connection');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/documents', sikDocumentRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('SIK-GO API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
    