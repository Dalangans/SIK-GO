const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  // Kita ganti 'userId' (Number) dengan 'email' (String)
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'ai_checker'],
    required: true,
    default: 'student' // Kita tambahkan default agar lebih aman
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Ini sudah bagus, jangan diubah
  }
  // Kita hapus field 'userId' karena sudah diganti 'email'
});

// Encrypt password using bcrypt (Ini sudah benar)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // penting: return agar tidak lanjut re-hash
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return (Ini sudah benar)
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password (Ini sudah benar)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);