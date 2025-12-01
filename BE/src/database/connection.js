const mongoose = require('mongoose');

const connectDB = async () => {
  // Development mode: skip MongoDB connection
  if (process.env.MONGODB_URI === 'skip') {
    console.log('[DB] ⚠ MongoDB connection skipped (MONGODB_URI=skip)');
    console.log('[DB] Running in offline development mode');
    return null;
  }

  try {
    console.log('[DB] Attempting to connect to MongoDB...');
    console.log('[DB] URI configured:', !!process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`[DB] ✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DB] ✗ Connection Error: ${error.message}`);
    console.error('[DB] This may be due to:');
    console.error('  1. MongoDB Atlas IP whitelist not configured');
    console.error('  2. Network/firewall blocking connection');
    console.error('  3. Invalid credentials in MONGODB_URI');
    console.error('[DB] To fix: Add your IP to MongoDB Atlas network access');
    throw error;
  }
};

module.exports = { connectDB };