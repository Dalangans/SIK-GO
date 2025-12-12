const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

// Middleware untuk memverifikasi Token (Login)
exports.protect = async (req, res, next) => {
  let token;
  // 1. Ambil token dari header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log('Auth Middleware - Token exists:', !!token);
  console.log('Auth Middleware - MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('Auth Middleware - NODE_ENV:', process.env.NODE_ENV);

  // 2. Check if token is missing
  if (!token) {
    // Only use development mode if MONGODB_URI is explicitly 'skip' (for offline testing)
    // Don't use it just because NODE_ENV is 'development'
    if (process.env.MONGODB_URI === 'skip') {
      console.log('Using development mode mock user (MONGODB_URI=skip)');
      const mongoose = require('mongoose');
      // Create mock user for development with valid ObjectId
      req.user = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Valid ObjectId for testing
        email: 'dev@example.com',
        name: 'Development User',
        role: 'admin',
        fullName: 'Development User'
      };
      return next();
    }
    console.log('No token provided and not in offline mode - returning 401');
    return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route - No token provided' 
    });
  }

  try {
    // 3. Verifikasi token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded, user ID:', decoded.id);

    // 4. Ambil data user berdasarkan ID di token
    const user = await User.findById(decoded.id).select('-password');
    console.log('User query result:', user ? `Found user ${user.email}` : 'User not found');

    if (!user) {
        console.log('User not found in database');
        return res.status(401).json({ success: false, message: 'User not found in database' });
    }
    
    console.log('Setting req.user with _id:', user._id);
    req.user = user;

    next();
  } catch (err) {
    console.error('Protection error:', err.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Token verification failed', 
      error: err.message 
    });
  }
};

// Middleware untuk membatasi akses berdasarkan Role (Admin, User, dll)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Pastikan req.user sudah ada (dari middleware protect)
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'User not authenticated' 
        });
    }
    // Cek apakah role user termasuk dalam roles yang diizinkan
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Allowed roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};