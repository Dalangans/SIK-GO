const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/route/authRoutes');
const userRoutes = require('./src/route/userRoutes');
const roomRoutes = require('./src/route/roomRoutes');
const sikDocumentRoutes = require('./src/route/sikDocumentRoutes');
const proposalRoutes = require('./src/route/proposalRoutes');
const bookingRoutes = require('./src/route/bookingRoutes');
const proposalAnalysisRoutes = require('./src/route/proposalAnalysisRoutes');
const proposalEvaluationRoutes = require('./src/route/proposalEvaluationRoutes');
const { connectDB } = require('./src/database/connection');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS eksplisit agar FE (Vite) bisa akses
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  maxAge: 3600
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log sederhana untuk debug
app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next(); });

// Definisikan sekali saja
const startServer = () => {
  if (app.locals.serverStarted) return;
  app.locals.serverStarted = true;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// Connect to database (start server after connected) sekali saja
(async () => {
  try {
    await connectDB();
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.warn('⚠ MongoDB connection failed:', err?.message);
    console.log('⚠ Starting server in offline mode (features limited)');
  }
  startServer();
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/documents', sikDocumentRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/proposals-evaluation', proposalEvaluationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/proposals-analysis', proposalAnalysisRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('SIK-GO API is running');
});

// 404 JSON
app.use((req, res) => res.status(404).json({ message: 'Not found', path: req.path }));
// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});
