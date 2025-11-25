# 📧 Email Verification - Quick Start

## ⚡ 3-Minute Setup

### Backend Setup

1. **Install nodemailer:**
   ```bash
   cd backend
   npm install nodemailer
   ```

2. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Enable 2FA first if not already enabled
   - Create App Password for "Mail" → "Other (SecureScan)"
   - Copy the 16-character password

3. **Update `backend/.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

4. **Restart backend:**
   ```bash
   npm start
   ```
   
   ✅ Look for: "Email server is ready to send messages"

### Test It

1. Register a new user
2. Check your email for the OTP
3. Enter the 6-digit code
4. Done! ✅

---

## 📁 .env File Example

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_secret_key_here

# Email Configuration (NEW)
EMAIL_USER=securescan.app@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop

# Server
PORT=3000
```

---

## 🎯 What Was Added

### Backend Files:
- `backend/config/mailer.js` - Email transporter
- `backend/controllers/otpController.js` - OTP logic
- `backend/routes/otp.js` - OTP routes

### Frontend Files:
- `frontend/app/verify-otp.tsx` - OTP verification screen
- `frontend/utils/otpService.ts` - OTP API calls

### Modified Files:
- `backend/server.js` - Added OTP routes
- `frontend/app/register.tsx` - Added OTP flow

---

## 🚨 Common Issues

### "Email transporter configuration error"
➡️ Check EMAIL_USER and EMAIL_PASS in .env  
➡️ Make sure you're using App Password (not regular password)  
➡️ Restart backend server

### "Email is not registered"
➡️ Complete registration first, THEN OTP is sent  
➡️ OTP sent to existing users only

### Email not received
➡️ Check spam folder  
➡️ Check backend console for "OTP sent to..."  
➡️ Verify EMAIL_USER is correct

---

## 📖 Full Documentation

See `EMAIL_VERIFICATION_SETUP.md` for complete details, troubleshooting, and production recommendations.

---

**Ready to test!** 🚀
