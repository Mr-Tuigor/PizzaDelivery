const router = require('express').Router();
const { registerUser, loginUser, logoutUser, updateUserDetail, updateUserPassword, getUser } = require('../controllers/authController');
const { forgotPassword, resetPassword, emailVerification, verifyEmail } = require('../controllers/passwordAndVerification');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/me', protect, getUser);

router.put('/profile', protect, updateUserDetail);
router.put('/password', protect, updateUserPassword);

router.post('/forgot-password', protect, forgotPassword);
router.post('/reset-password', protect, resetPassword);
router.post('/email-verification', protect, emailVerification);
router.post('/verify-email', protect, verifyEmail);

module.exports = router;