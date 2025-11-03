# SecureScan - Fraud Detection Mobile App

A comprehensive fraud detection system with React Native mobile app, Node.js backend, and Flask ML service for detecting malicious links and QR codes.

## 📋 Overview

SecureScan is a cross-platform mobile application that helps users identify fraudulent links and QR codes using machine learning. It features:

- **Fraud Link Detection**: Analyzes URLs using a Hugging Face ML model
- **QR Code Scanner**: Extracts and validates URLs from QR codes
- **Community Platform**: Share findings and discuss with other users
- **Real-time Analysis**: Instant fraud detection with confidence scores

## 🏗️ Architecture

```
SecureScan/
├── frontend/          # React Native + Expo mobile app
├── backend/           # Node.js + Express.js API server
└── ml-service/        # Flask + ML fraud detection service
```

### Tech Stack

**Frontend:**
- React Native with Expo
- TypeScript
- Expo Router for navigation
- Axios for API calls
- Dark theme UI with orange accent (#e17055)

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- Proxy to ML service

**ML Service:**
- Flask (Python)
- Hugging Face Transformers
- OpenCV for QR code extraction
- Model: `r3ddkahili/final-complete-malicious-url-model`

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MongoDB (local or Atlas)
- Expo CLI: `npm install -g expo-cli`

### Installation

1. **Clone the repository:**
```bash
cd SecureScan
```

2. **Setup ML Service (Flask):**
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```
The ML service will run on `http://localhost:5000`

3. **Setup Backend (Node.js):**
```bash
cd ../backend
npm install
cp .env.example .env
# Edit .env file with your MongoDB URI and JWT secret
npm run dev
```
The backend will run on `http://localhost:3000`

4. **Setup Frontend (React Native):**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env file with your backend URL
npm start
```

Press `i` for iOS, `a` for Android, or `w` for web.

## 📱 Features

### 1. Link Detection
- Enter any URL
- ML model analyzes for malicious patterns
- Returns safety status with confidence score
- Visual indicators for safe/fraudulent links

### 2. QR Code Detection
- Upload QR code images
- Extracts embedded URLs using OpenCV
- Analyzes extracted URL with ML model
- Comprehensive fraud assessment

### 3. Community Feed
- Create posts about fraudulent findings
- Like and comment on posts
- View user profiles and post history
- Real-time updates

### 4. User Authentication
- Secure JWT-based auth
- Registration and login
- Protected routes
- User profiles

## 🔌 API Endpoints

### Backend (Node.js)

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Posts:**
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)
- `POST /api/posts/:id/like` - Like/unlike post (auth required)
- `POST /api/posts/:id/comment` - Add comment (auth required)

**Detection (Proxy to Flask):**
- `POST /api/detect/link` - Detect malicious link
- `POST /api/detect/qr` - Scan QR code and detect

### ML Service (Flask)

- `GET /api/health` - Health check
- `POST /api/detect_link` - Analyze URL
- `POST /api/detect_qr` - Extract and analyze QR code

## 🗄️ Database Schema

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

### Post
```javascript
{
  userId: ObjectId,
  content: String,
  image: String,
  likes: [ObjectId],
  comments: [{
    userId: ObjectId,
    text: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

## 🎨 UI/UX

- **Color Scheme**: Dark theme with professional orange accent
- **Navigation**: Bottom tabs + stack navigation
- **Responsive**: Works on all screen sizes
- **Accessibility**: Clear visual indicators for fraud detection

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Input validation on all endpoints
- CORS enabled for frontend integration
- Environment variables for sensitive data

## 📦 Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/securescan
JWT_SECRET=your_secret_key
ML_SERVICE_URL=http://localhost:5000
```

### ML Service (.env)
```
PORT=5000
DEBUG=True
```

### Frontend (.env)
```
API_URL=http://localhost:3000/api
```

## 🧪 Testing

**Test Link Detection:**
```bash
curl -X POST http://localhost:5000/api/detect_link \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Test Backend Health:**
```bash
curl http://localhost:3000/api/health
```

## 📊 ML Model

- **Model**: Hugging Face transformer for URL classification
- **Input**: Raw URL string
- **Output**: Binary classification (safe/malicious) with confidence
- **Performance**: Real-time inference using PyTorch

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm start
```

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### ML Service Development
```bash
cd ml-service
export DEBUG=True
python app.py
```

## 📱 Mobile App Screens

1. **Home** - Quick access to all features
2. **Link Checker** - URL input and results
3. **QR Scanner** - Image upload and analysis
4. **Community** - Social feed with posts
5. **Profile** - User info and settings
6. **Login/Register** - Authentication
7. **Create Post** - Share findings

## 🐛 Troubleshooting

### ML Service won't start:
- Ensure Python 3.8+ is installed
- Install pyzbar dependencies (may require system packages on Linux)
- Check model download (first run downloads from Hugging Face)

### Backend connection issues:
- Verify MongoDB is running
- Check `.env` configuration
- Ensure port 3000 is not in use

### Frontend not connecting:
- Use your local IP instead of `localhost` for physical devices
- Check `API_URL` in `.env`
- Verify backend is running

## 🚢 Deployment

### Backend (Node.js)
- Deploy to Heroku, AWS, or DigitalOcean
- Set environment variables
- Connect to MongoDB Atlas

### ML Service (Flask)
- Deploy to Heroku, AWS, or dedicated server
- Requires sufficient RAM for ML model (2GB+)
- Configure gunicorn for production

### Mobile App
- Build with EAS: `eas build --platform ios/android`
- Publish to App Store / Google Play

## 📄 License

This project is for educational purposes.

## 👥 Support

For issues or questions:
1. Check individual service READMEs
2. Ensure all services are running
3. Verify environment variables
4. Check network connectivity

## 🎯 Future Enhancements

- Real-time QR scanning with camera
- Push notifications for community
- Advanced analytics dashboard
- Multi-language support
- Dark/light theme toggle
- Export fraud reports
- Browser extension

---

Built with ❤️ for online safety
