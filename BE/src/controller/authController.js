const userRepository = require('../repository/userRepository');
const mongoose = require('mongoose');

// Register user
exports.register = async (req, res) => {
  try {
    // Cek koneksi database dengan timeout
    if (mongoose.connection.readyState === 0) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database unavailable. Pastikan MongoDB_URI benar di .env. Retry later.' 
      });
    }
    if (mongoose.connection.readyState === 2) {
      await mongoose.connection.asPromise(); // tunggu selesai connect
    }
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email, password required' });
    }

    // Validasi role (hanya allow: student, admin, ai_checker)
    let userRole = role || 'student'; // Default ke 'student' jika tidak disupply
    if (role && !['student', 'admin', 'ai_checker'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role tidak valid. Gunakan: student, admin, atau ai_checker' 
      });
    }

    const userData = { name, email, password, role: userRole };
    const user = await userRepository.createUser(userData);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Login use
exports.login = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 0) {
      return res.status(503).json({ success: false, error: 'Database unavailable. Retry later.' });
    }
    if (mongoose.connection.readyState === 2) {
      await mongoose.connection.asPromise();
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email and password"
      });
    }

    const user = await userRepository.findUserByEmail(email);
    await userRepository.validateCredentials(user, password);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    const user = await userRepository.getUserById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Helper to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
