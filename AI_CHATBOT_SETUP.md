# AI Chatbot - Quick Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Install Package
```bash
cd frontend
npm install @google/generative-ai
```

### Step 2: Get API Key

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with Google account
3. Click "**Create API Key**"
4. Copy the generated key

### Step 3: Add API Key

Open: `frontend/utils/aiService.ts`

**Line 5:** Replace with your key:
```typescript
const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

## ✅ That's It!

Run the app and tap the **"AI Assistant"** tab (chatbubbles icon)!

---

## 📱 What You Get

### AI Chatbot Features
✅ Google Gemini Pro AI  
✅ Specialized in fraud detection & security  
✅ Beautiful modern UI with gradients  
✅ Persistent chat history  
✅ Typing indicators  
✅ Smooth animations  
✅ Error handling  

### What the AI Helps With
- How to use QR scanner and link checker
- Understanding scan results (Phishing, Malware, etc.)
- Online safety tips
- Threat levels and confidence scores
- General cybersecurity advice

---

## 🎨 UI Preview

**User Messages:** Blue gradient bubbles (right side)  
**AI Messages:** White cards with sparkles avatar (left side)  
**Header:** Gradient icon with "AI Assistant" title  
**Input:** Modern card with gradient send button  

---

## 🔑 Getting Your Free API Key

### Google AI Studio (Gemini)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "**Create API Key**"
4. Select or create a project
5. Copy the API key (starts with `AIzaSy...`)
6. Paste it in `frontend/utils/aiService.ts`

### Free Tier Limits
- ✅ **60 requests/minute**
- ✅ **1,500 requests/day**
- ✅ Perfect for development and testing!

---

## 📝 Example Usage

### Ask about Features
```
User: "How do I scan a QR code?"

AI: "To scan a QR code in SecureScan:
1. Tap the 'QR Scanner' tab
2. Tap 'Upload QR Code Image'
3. Select your QR code image
4. Our AI will analyze it instantly!"
```

### Get Security Advice
```
User: "What should I do if I find a phishing link?"

AI: "If you discover a phishing link:
• Don't click it or enter any information
• Report it to relevant authorities
• Warn others who may have received it
• Use SecureScan to verify suspicious links
Stay safe! 🔒"
```

### Understand Results
```
User: "What does 85% confidence mean?"

AI: "An 85% confidence score means our AI is highly 
certain about the classification. Scores above 80% 
are very reliable. Always combine this with other 
indicators like suspicious URLs or unusual requests."
```

---

## 🛠️ Troubleshooting

### "API key error"
➡️ Check if you copied the full API key  
➡️ Make sure it's enabled for Gemini API  
➡️ Try generating a new key  

### "Package not found"
➡️ Run: `npm install @google/generative-ai`  
➡️ Make sure you're in the `frontend` folder  

### Slow responses
➡️ Check your internet connection  
➡️ Gemini servers may be busy, try again  
➡️ Free tier has rate limits (60/min)  

---

## 🔒 Security Notes

**✅ DO:**
- Keep your API key private
- Use environment variables in production
- Rotate keys if exposed

**❌ DON'T:**
- Commit API keys to git
- Share API keys publicly
- Use the same key across multiple apps

---

## 📂 Files to Check

### New Files Created
1. `frontend/utils/aiService.ts` - AI integration
2. `frontend/app/(tabs)/ai-chat.tsx` - Chat UI

### Modified Files
1. `frontend/app/(tabs)/_layout.tsx` - Added tab

---

## 🎯 Next Steps

After setup:
1. **Test the chat** - Send a message and get AI response
2. **Clear chat** - Try the trash icon to reset
3. **Ask questions** - About QR scanning, security, etc.
4. **Check persistence** - Close and reopen app, history saved!

---

## 📚 Full Documentation

For detailed information, see:
- `AI_CHATBOT_IMPLEMENTATION.md` - Complete guide
- API customization options
- Advanced features
- Troubleshooting details

---

## 💡 Tips

**Make it yours:**
- Change AI personality in `aiService.ts` system context
- Adjust response length with `maxOutputTokens`
- Customize colors in `ai-chat.tsx`
- Add suggested quick replies

**Free tier is plenty:**
- 1,500 requests/day = ~50 messages/day per user
- Perfect for personal use and testing
- Upgrade only if building large-scale app

---

## ✨ You're Ready!

The AI chatbot is now integrated into your SecureScan app!

**Tab Location:** Bottom navigation → AI Assistant (chatbubbles icon)

Enjoy your AI-powered security assistant! 🤖🔒
