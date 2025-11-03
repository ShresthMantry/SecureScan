# SecureScan Project Setup Guide

Complete setup instructions for the SecureScan fraud detection application.

## System Requirements

- **Operating System**: macOS, Linux, or Windows
- **Node.js**: v16.x or higher
- **Python**: 3.11 (Python 3.13 is not yet compatible with some ML libraries)
- **MongoDB**: v4.4 or higher (local or Atlas)
- **Memory**: 4GB RAM minimum (8GB recommended for ML model)
- **Storage**: 2GB free space

## Step-by-Step Installation

### 1. Install Prerequisites

#### macOS:
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Watchman (for file watching in React Native)
brew install watchman

# Install Python
brew install python@3.11

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

#### Ubuntu/Linux:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt-get install python3.11 python3.11-venv python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Windows:
- Download and install [Node.js](https://nodejs.org/)
- Download and install [Python 3.11](https://www.python.org/downloads/)
- Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)

### 2. Setup ML Service (Flask)

```bash
cd ml-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Start the service
python app.py
```

The ML service will:
- Download the Hugging Face model on first run (may take a few minutes)
- Start on http://localhost:5001
- Display "Model loaded successfully!" when ready

### 3. Setup Backend (Node.js)

Open a new terminal window:

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
# macOS/Linux:
nano .env
# Windows:
notepad .env
```

Update the `.env` file:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/securescan
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ML_SERVICE_URL=http://localhost:5001
```

Start the backend:
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The backend will run on http://localhost:3000

### 4. Setup Frontend (React Native)

Open a new terminal window:

```bash
# Install Expo CLI globally (if not installed)
npm install -g expo-cli

cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# IMPORTANT: Update the API_URL in .env file
# Find your local IP address:
# macOS: ifconfig | grep "inet " | grep -v 127.0.0.1
# Windows: ipconfig
# Linux: ip addr show

# Edit .env file and replace localhost with your IP
nano .env
# Change API_URL=http://localhost:3000/api
# To API_URL=http://YOUR_IP_ADDRESS:3000/api
# Example: API_URL=http://192.168.1.20:3000/api
```

Start the frontend:
```bash
npm start
```

### 5. Run the Mobile App

After running `npm start`:

**Option 1: iOS Simulator (macOS only)**
- Press `i` in the terminal
- Or run: `npm run ios`

**Option 2: Android Emulator**
- Start Android Studio emulator first
- Press `a` in the terminal
- Or run: `npm run android`

**Option 3: Physical Device**
- Install Expo Go app from App Store/Google Play
- Scan the QR code shown in terminal
- Make sure your phone and computer are on the same WiFi network

**Option 4: Web Browser**
- Press `w` in the terminal
- Or run: `npm run web`

## Verification Steps

### 1. Test ML Service
```bash
curl -X POST http://localhost:5001/api/detect_link \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

Expected output:
```json
{
  "url": "https://google.com",
  "prediction": "safe",
  "confidence": 0.95,
  "is_fraudulent": false
}
```

### 2. Test Backend
```bash
curl http://localhost:3000/api/health
```

Expected output:
```json
{
  "status": "running",
  "service": "SecureScan Backend API",
  "timestamp": "2025-11-03T..."
}
```

### 3. Test Frontend
Open the app and:
1. Register a new account
2. Login with your credentials
3. Navigate to "Link Checker"
4. Test a URL (e.g., https://google.com)
5. View the results

## Common Issues and Solutions

### Issue: Python 3.13 compatibility error
**Problem:** You're using Python 3.13, which is too new for the ML libraries.
**Solution:**
```bash
# Check your Python version
python3 --version

# If it shows 3.13, install Python 3.11
# macOS:
brew install python@3.11

# Then recreate your virtual environment with Python 3.11
cd ml-service
rm -rf venv  # Remove old venv
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: ML model download fails
**Solution:**
```bash
# Manually download model
python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; AutoTokenizer.from_pretrained('r3ddkahili/final-complete-malicious-url-model'); AutoModelForSequenceClassification.from_pretrained('r3ddkahili/final-complete-malicious-url-model')"
```

### Issue: MongoDB connection error
**Solution:**
```bash
# Check if MongoDB is running
# macOS:
brew services list
# Linux:
sudo systemctl status mongod
# Windows:
services.msc (look for MongoDB)

# Start MongoDB if not running
# macOS:
brew services start mongodb-community
# Linux:
sudo systemctl start mongod
# Windows:
net start MongoDB
```

### Issue: Port already in use
**Solution:**
```bash
# Find and kill process using port 3000 (Backend)
# macOS/Linux:
lsof -ti:3000 | xargs kill -9
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Find and kill process using port 5001 (ML Service)
# macOS/Linux:
lsof -ti:5001 | xargs kill -9
# Windows:
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### Issue: Frontend can't connect to backend on physical device
**Problem:** The app loads but can't fetch data from the backend.
**Solution:**
1. Make sure you updated the `API_URL` in `frontend/.env` to use your computer's IP address (not localhost)
2. Find your IP address: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. Update `.env`: `API_URL=http://YOUR_IP:3000/api`
4. Restart Expo dev server: `npm start`
5. Make sure your phone and computer are on the same WiFi network
6. Ensure firewall allows connections on port 3000

### Issue: Login/Register not working
**Problem:** Frontend loads but authentication fails.
**Troubleshooting steps:**
1. **Check if backend is running:**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"running","service":"SecureScan Backend API",...}
   ```

2. **Check if MongoDB is running:**
   ```bash
   # macOS:
   brew services list | grep mongodb
   # Should show "started"
   ```

3. **Test registration endpoint directly:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@test.com","password":"test123"}'
   ```

4. **Check if your phone can reach the backend:**
   - Open Safari/Chrome on your phone
   - Go to `http://YOUR_IP:3000/api/health` (use same IP as in .env)
   - You should see the health check response
   - If timeout/can't connect: Check firewall settings

5. **Check backend logs:**
   - Look at the terminal running your backend
   - You should see POST requests to `/api/auth/register` or `/api/auth/login`
   - If no requests appear, it's a network/connectivity issue

6. **Common fixes:**
   - Restart backend: `cd backend && npm run dev`
   - Restart frontend: Stop and run `npx expo start --clear`
   - Check `.env` file has correct IP (not localhost)
   - Disable macOS firewall temporarily to test
   - Try using `0.0.0.0` instead of specific IP in some cases

### Issue: Python dependencies installation fails
**Solution:**
```bash
# Make sure you're using Python 3.11, not 3.13
python3.11 --version

# If using Python 3.13, recreate venv with Python 3.11
deactivate  # if venv is active
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate

# Install system dependencies for pyzbar
# macOS:
brew install zbar
# Ubuntu:
sudo apt-get install libzbar0
# Windows: Install Visual C++ Build Tools
```

## Development Workflow

1. **Start all services in this order:**
   ```bash
   # Terminal 1: ML Service
   cd ml-service && source venv/bin/activate && python app.py
   
   # Terminal 2: Backend
   cd backend && npm run dev
   
   # Terminal 3: Frontend
   cd frontend && npm start
   ```

2. **Code changes:**
   - Frontend: Auto-reloads on save
   - Backend: Auto-reloads with nodemon
   - ML Service: Restart manually

3. **Testing:**
   - Use Postman or curl for API testing
   - Use React Native Debugger for frontend
   - Check terminal logs for errors

## Production Deployment

### Backend:
```bash
# Build for production
npm install --production
NODE_ENV=production node server.js
```

### ML Service:
```bash
# Use gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend:
```bash
# Build with EAS
npx eas build --platform all
```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Hugging Face Models](https://huggingface.co/models)

## Support

If you encounter issues:
1. Check the logs in each terminal window
2. Verify all environment variables are set correctly
3. Ensure all services are running
4. Check network connectivity
5. Review the README files in each service directory

## Next Steps

After successful setup:
1. Explore the app features
2. Test link and QR detection
3. Create posts in the community
4. Review the code structure
5. Customize the theme and features
6. Add your own fraud detection rules

Happy coding! 🚀
