const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI === 'skip') {
      console.log('✓ MongoDB connection skipped (development mode)');
      return null;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✓ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.error('  - Check MONGODB_URI in .env');
    console.error('  - Check internet connection');
    console.error('  - Check MongoDB cluster IP whitelist');
    throw error;
  }
};

module.exports = { connectDB };