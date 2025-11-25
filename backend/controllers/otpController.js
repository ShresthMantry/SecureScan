const transporter = require('../config/mailer');
const User = require('../models/User'); // Import User model for email validation

let otpStore = {}; // Temporary storage for OTPs (In production, use Redis or database)

// Generate a random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// Send OTP function (used for both initial send and resend)
const sendOtp = async (req, res) => {
  const { email, skipUserCheck } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if the email exists in the database (skip for new registrations)
    if (!skipUserCheck) {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'Email is not registered' });
      }
    }

    // Check if an OTP already exists for this email
    const existingOtp = otpStore[email];
    let otp;

    if (existingOtp && Date.now() < existingOtp.expiresAt) {
      // Use existing OTP if it's still valid
      otp = existingOtp.otp;
    } else {
      // Generate a new OTP
      otp = generateOtp();
      otpStore[email] = { otp, expiresAt: Date.now() + 300000 }; // 5 minutes expiry
    }

    // Send OTP via email
    await transporter.sendMail({
      from: `"SecureScan Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for SecureScan Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🔒 SecureScan</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
            <p style="color: #666; font-size: 16px;">Hello,</p>
            <p style="color: #666; font-size: 16px;">Your OTP for SecureScan verification is:</p>
            <div style="background-color: #f8f9fa; border: 2px dashed #6366F1; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <h1 style="color: #6366F1; margin: 0; font-size: 42px; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">⏱️ This OTP is valid for <strong>5 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message from SecureScan. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `Your OTP for SecureScan verification is ${otp}. It is valid for 5 minutes.`,
    });

    console.log(`✅ OTP sent to ${email}: ${otp} (expires in 5 mins)`);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify OTP function
const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const storedOtp = otpStore[email];

  if (!storedOtp) {
    return res.status(400).json({ message: 'No OTP sent to this email' });
  }

  if (Date.now() > storedOtp.expiresAt) {
    delete otpStore[email]; // Delete expired OTP
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (parseInt(otp, 10) === storedOtp.otp) {
    delete otpStore[email]; // Delete OTP after successful verification
    console.log(`✅ OTP verified successfully for ${email}`);
    return res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
};

// Resend OTP function (reuses the sendOtp logic)
const resendOtp = async (req, res) => {
  const { email } = req.body;
  
  // Delete existing OTP to force generation of new one
  if (otpStore[email]) {
    delete otpStore[email];
  }
  
  await sendOtp(req, res);
};

module.exports = { sendOtp, verifyOtp, resendOtp };
