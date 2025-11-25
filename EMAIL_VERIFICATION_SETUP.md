# 📧 Email Verification (OTP) Setup Guide

## Overview

SecureScan now includes **email verification using OTP (One-Time Password)** sent via Gmail using Nodemailer. This adds an extra layer of security to the registration process.

---

## 🎯 Features

✅ **6-digit OTP** sent to user's email during registration  
✅ **5-minute expiration** for security  
✅ **Resend OTP** functionality with 60-second cooldown  
✅ **Beautiful UI** with animations and auto-focus  
✅ **Auto-verification** when all 6 digits are entered  
✅ **Shake animation** on invalid OTP  
✅ **Email templates** with branded HTML design  

---

## 🚀 Quick Setup (Backend)

### Step 1: Install Dependencies

```bash
cd backend
npm install nodemailer
```

### Step 2: Generate Gmail App Password

**Important:** You CANNOT use your regular Gmail password. You must generate an **App Password**.

#### How to Get Gmail App Password:

1. **Enable 2-Factor Authentication** on your Google account:
   - Go to: https://myaccount.google.com/security
   - Under "Signing in to Google", enable **2-Step Verification**

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → Enter "SecureScan"
   - Click **Generate**
   - Copy the **16-character password** (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Update .env File

Add these variables to `backend/.env`:

```env
# Email Configuration for OTP
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # Use the App Password from Step 2 (include spaces or remove them)

# Example:
# EMAIL_USER=securescan@gmail.com
# EMAIL_PASS=abcd efgh ijkl mnop
```

### Step 4: Restart Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ Email server is ready to send messages
```

---

## 📱 Registration Flow

### Old Flow:
```
Register → Login
```

### New Flow:
```
Register → OTP Sent via Email → Verify OTP → Login
```

---

## 🔌 API Endpoints

### 1. Send OTP
**POST** `/api/otp/send`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "OTP sent to your email"
}
```

**Response (Error):**
```json
{
  "message": "Email is not registered"
}
```

---

### 2. Verify OTP
**POST** `/api/otp/verify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "OTP verified successfully"
}
```

**Response (Error):**
```json
{
  "message": "Invalid OTP"
}
// OR
{
  "message": "OTP has expired"
}
```

---

### 3. Resend OTP
**POST** `/api/otp/resend`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "OTP sent to your email"
}
```

---

## 🎨 Frontend Components

### New Screen: `verify-otp.tsx`

Features:
- **6 separate input boxes** for OTP digits
- **Auto-focus** on next input
- **Auto-verification** when complete
- **60-second resend timer**
- **Shake animation** on error
- **Gradient icon** header
- **Beautiful card UI**

### Updated: `register.tsx`

Now includes:
- OTP send after successful registration
- Navigation to OTP verification screen
- Email passed as parameter

### New Utility: `otpService.ts`

Provides:
- `sendOtp(email)` - Send OTP to email
- `verifyOtp(email, otp)` - Verify OTP
- `resendOtp(email)` - Resend OTP

---

## 📂 Files Created/Modified

### Backend Files Created:
- ✅ `backend/config/mailer.js` - Nodemailer transporter configuration
- ✅ `backend/controllers/otpController.js` - OTP logic (send, verify, resend)
- ✅ `backend/routes/otp.js` - OTP API routes

### Backend Files Modified:
- ✅ `backend/package.json` - Added nodemailer dependency
- ✅ `backend/server.js` - Registered OTP routes
- ✅ `backend/.env` - Added EMAIL_USER and EMAIL_PASS variables

### Frontend Files Created:
- ✅ `frontend/app/verify-otp.tsx` - OTP verification screen
- ✅ `frontend/utils/otpService.ts` - OTP API service

### Frontend Files Modified:
- ✅ `frontend/app/register.tsx` - Added OTP flow after registration

---

## 🎯 User Experience

### 1. **Registration**
User enters username, email, password → Clicks Register

### 2. **Email Sent**
Beautiful branded email arrives with:
- SecureScan logo/header
- Large 6-digit OTP in colored box
- 5-minute expiration notice
- Security message

### 3. **OTP Screen**
- Automatic navigation to verification screen
- Email address displayed
- 6 input boxes with auto-focus
- Countdown timer (5:00 → 0:00)
- Resend button (available after 60 seconds)

### 4. **Verification**
- User enters OTP (auto-verifies when complete)
- OR clicks "Verify Email" button
- Success → Navigate to Login
- Error → Shake animation + clear inputs

---

## 📧 Email Template

The OTP email includes:

```
┌─────────────────────────────────┐
│     🔒 SecureScan (Gradient)    │
├─────────────────────────────────┤
│ Your Verification Code          │
│                                 │
│ Hello,                          │
│ Your OTP for SecureScan is:     │
│                                 │
│   ┌───────────────────┐         │
│   │     1 2 3 4 5 6   │         │
│   └───────────────────┘         │
│                                 │
│ ⏱️ Valid for 5 minutes          │
│ If you didn't request this,     │
│ please ignore this email.       │
├─────────────────────────────────┤
│ Automated message - Do not reply│
└─────────────────────────────────┘
```

---

## 🔒 Security Features

1. **5-minute expiration** - OTP expires after 5 minutes
2. **One-time use** - OTP deleted after successful verification
3. **Email validation** - OTP only sent to registered emails
4. **Rate limiting** - Prevents spam (existing OTP reused if valid)
5. **Secure storage** - OTPs stored in memory (use Redis in production)

---

## 🧪 Testing

### Test OTP Flow:

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Register New User:**
   - Open app → Register screen
   - Fill in details
   - Click "Register"
   - Check console for OTP (logged for development)

4. **Check Email:**
   - Open Gmail inbox
   - Look for "Your OTP for SecureScan Verification"
   - Note the 6-digit code

5. **Verify OTP:**
   - Enter OTP in app
   - Should auto-verify or click "Verify Email"
   - Success message → Login screen

6. **Test Resend:**
   - Wait 60 seconds
   - Click "Resend Code"
   - Check email for new OTP

### Test Invalid Scenarios:

- ❌ **Wrong OTP:** Should show "Invalid OTP" + shake animation
- ❌ **Expired OTP:** Wait 5+ minutes → Should show "OTP has expired"
- ❌ **Unregistered Email:** Should show "Email is not registered"

---

## 🛠️ Troubleshooting

### "Failed to send OTP"

**Cause:** Email configuration issue

**Solution:**
1. Check `.env` file has correct EMAIL_USER and EMAIL_PASS
2. Verify App Password is correct (16 characters)
3. Check 2FA is enabled on Gmail account
4. Restart backend server

### "Email transporter configuration error"

**Cause:** Invalid Gmail credentials

**Solution:**
1. Regenerate App Password
2. Update `.env` file
3. Restart server

### Email Not Received

**Check:**
1. ✅ Spam/Junk folder
2. ✅ Correct email entered during registration
3. ✅ Backend console shows "✅ OTP sent to..."
4. ✅ Internet connection active

### OTP Always "Invalid"

**Check:**
1. ✅ Entering correct 6 digits (check backend console logs)
2. ✅ OTP not expired (< 5 minutes)
3. ✅ No extra spaces in OTP input

---

## 🎨 UI Customization

### Change OTP Length:
In `frontend/app/verify-otp.tsx`:
```typescript
const OTP_LENGTH = 6; // Change to 4, 8, etc.
```

### Change Timer Duration:
In `frontend/app/verify-otp.tsx`:
```typescript
const RESEND_TIMER = 60; // Change to 30, 90, etc. (seconds)
```

In `backend/controllers/otpController.js`:
```javascript
expiresAt: Date.now() + 300000 // Change 300000 to desired milliseconds
// 60000 = 1 minute
// 300000 = 5 minutes
// 600000 = 10 minutes
```

### Change Email Template:
In `backend/controllers/otpController.js`, modify the `html` content in `transporter.sendMail()`.

---

## 🚀 Production Recommendations

### 1. Use Redis for OTP Storage
Replace in-memory `otpStore` with Redis:

```javascript
const redis = require('redis');
const client = redis.createClient();

// Store OTP
await client.setex(`otp:${email}`, 300, otp); // 5 minutes

// Verify OTP
const storedOtp = await client.get(`otp:${email}`);

// Delete OTP
await client.del(`otp:${email}`);
```

### 2. Add Rate Limiting
Prevent OTP spam:

```javascript
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes
  message: 'Too many OTP requests, please try again later',
});

router.post('/send', otpLimiter, sendOtp);
```

### 3. Use Environment-Specific Email Service
For production, consider:
- **SendGrid** (99% deliverability)
- **AWS SES** (cheap and reliable)
- **Mailgun** (powerful API)

### 4. Add Email Verification Status to User Model
Track verification state:

```javascript
// User.js
{
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: Date,
}
```

### 5. Prevent Login Before Verification
In `backend/routes/auth.js`:

```javascript
router.post('/login', async (req, res) => {
  // ... existing login logic ...
  
  if (!user.emailVerified) {
    return res.status(403).json({ 
      error: 'Please verify your email before logging in' 
    });
  }
  
  // ... continue with login ...
});
```

---

## 📊 Monitoring

### Backend Logs to Watch:

```
✅ Email server is ready to send messages
✅ OTP sent to user@example.com: 123456 (expires in 5 mins)
✅ OTP verified successfully for user@example.com
```

### Frontend Console Logs:

```
OTP sent successfully
Verifying OTP...
OTP verified! Navigating to login...
```

---

## 🎯 Next Steps

After implementing OTP verification, consider adding:

1. **SMS OTP** as alternative (using Twilio)
2. **Remember device** to skip OTP for trusted devices
3. **Biometric verification** for mobile app
4. **2FA for login** (not just registration)
5. **Email change verification** when users update email
6. **Password reset via OTP**

---

## 📝 Summary

✅ **Backend:** Nodemailer + Gmail configured  
✅ **API:** 3 endpoints (send, verify, resend)  
✅ **Frontend:** Beautiful OTP screen with auto-verification  
✅ **Security:** 5-min expiration, one-time use  
✅ **UX:** Auto-focus, timer, resend button, animations  

---

## 🔗 Related Documentation

- `SETUP_GUIDE.md` - Main project setup
- `README.md` - Project overview
- `AI_CHATBOT_SETUP.md` - AI chatbot configuration

---

**Need Help?** Check the Troubleshooting section above or contact the development team!

🔒 **Stay Secure with SecureScan!**
