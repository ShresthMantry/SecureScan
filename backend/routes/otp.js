const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, resendOtp } = require('../controllers/otpController');

// POST /api/otp/send - Send OTP to email
router.post('/send', sendOtp);

// POST /api/otp/verify - Verify OTP
router.post('/verify', verifyOtp);

// POST /api/otp/resend - Resend OTP
router.post('/resend', resendOtp);

module.exports = router;
