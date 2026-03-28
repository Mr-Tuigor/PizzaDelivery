
const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String, // for Rest Password
  resetPasswordExpire: {
    type: Date,
    expires: 600, // <--- 600 seconds = 10 minutes
    default: undefined // Only exists when a reset is requested
  },
  verifyEmailToken: String, // for Email Verification
  resetEmailVerificationExpire: {
    type: Date,
    expires: 600, // <--- 600 seconds = 10 minutes
    default: undefined // Only exists when a reset is requested
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);