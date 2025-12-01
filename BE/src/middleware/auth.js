const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

// Middleware untuk memverifikasi Token (Login)
exports.protect = async (req, res, next) => {
  let token;

  // 1. Ambil token dari header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. DEVELOPMENT MODE: Jika tidak ada token dan mode development
  if (!token) {
    // Check if in development/offline mode
    if (process.env.MONGODB_URI === 'skip' || process.env.NODE_ENV === 'development') {
      // Create mock user for development
      req.user = {
        _id: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        role: 'user',
        fullName: 'Development User'
      };
      return next();
    }
    
    return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
    });
  }

  try {
    // 3. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Ambil data user berdasarkan ID di token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized (Token Invalid)' });
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
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    
    next();
  };
};