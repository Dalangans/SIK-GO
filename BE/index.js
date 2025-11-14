const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./src/route/authRoutes');
const userRoutes = require('./src/route/userRoutes');
const roomRoutes = require('./src/route/roomRoutes');
const sikDocumentRoutes = require('./src/route/sikDocumentRoutes');
const { connectDB } = require('./src/database/connection');
//const User = require('./src/database/models/User'); // tambah: untuk fallback register

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
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Log sederhana untuk debug
app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next(); });

// Definisikan sekali saja
const startServer = () => {
  if (app.locals.serverStarted) return;
  app.locals.serverStarted = true;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// Connect to database (start server after connected) sekali saja
connectDB()
  .then(() => {
    console.log('MongoDB connected');
    startServer();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err?.message);
    // tetap jalankan server agar endpoint bisa menampilkan error
    startServer();
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/documents', sikDocumentRoutes);

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
