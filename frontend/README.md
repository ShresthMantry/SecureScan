# SecureScan - React Native Frontend

Cross-platform mobile app built with React Native and Expo for fraud detection and community sharing.

## Features

- **Link Checker**: Analyze URLs for malicious content
- **QR Scanner**: Upload QR codes to extract and verify URLs
- **Community Feed**: Share findings and discuss with other users
- **User Authentication**: JWT-based login and registration
- **Dark Theme**: Modern, minimalistic UI with orange accents

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio for emulators
- Expo Go app on your physical device (optional)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend API URL:
```
API_URL=http://your-computer-ip:3000/api
```

**Note**: For testing on physical devices, replace `localhost` with your computer's local IP address (e.g., `http://192.168.1.100:3000/api`)

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platforms:

**iOS Simulator (Mac only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Web Browser:**
```bash
npm run web
```

### Testing on Physical Device:

1. Install the Expo Go app from App Store or Google Play
2. Scan the QR code from the terminal
3. The app will load on your device

## Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigator screens
│   │   ├── index.tsx      # Home screen
│   │   ├── link-checker.tsx
│   │   ├── qr-scanner.tsx
│   │   ├── community.tsx
│   │   ├── profile.tsx
│   │   └── _layout.tsx    # Tab layout configuration
│   ├── _layout.tsx        # Root layout
│   ├── login.tsx
│   ├── register.tsx
│   └── create-post.tsx
├── components/            # Reusable components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── PostCard.tsx
├── contexts/              # React contexts
│   └── AuthContext.tsx
├── utils/                 # Utilities and services
│   ├── api.ts
│   ├── authService.ts
│   ├── detectionService.ts
│   └── postService.ts
├── constants/             # Constants and theme
│   └── theme.ts
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **TypeScript**: Type-safe JavaScript
- **Expo Router**: File-based navigation
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Local data persistence
- **Expo Camera & Image Picker**: Camera and gallery access

## API Integration

The app connects to two backend services:

1. **Node.js Backend** (`http://localhost:3000/api`):
   - User authentication
   - Community posts
   - Proxies ML requests

2. **Flask ML Service** (via Node.js proxy):
   - Link fraud detection
   - QR code analysis

## Screens

### Authentication
- **Login**: Email/password authentication
- **Register**: Create new account

### Main Tabs
- **Home**: Quick access to all features
- **Link Checker**: Input URL for fraud detection
- **QR Scanner**: Upload QR code images
- **Community**: View and create posts
- **Profile**: User info and settings

### Additional Screens
- **Create Post**: Share findings with community
- **Post Details**: View comments on a post
- **User Posts**: View posts by specific user

## Theme Customization

Edit `constants/theme.ts` to customize:
- Colors (primary, background, etc.)
- Spacing and padding
- Border radius
- Font sizes and weights

## Troubleshooting

### Metro bundler issues:
```bash
npx expo start --clear
```

### iOS simulator issues:
```bash
npx expo run:ios --clean
```

### Android build issues:
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

### Network errors:
- Ensure backend services are running
- Check `API_URL` in `.env` file
- Use your local IP address, not `localhost` for physical devices
- Disable firewall if blocking connections

## Development Tips

1. **Hot Reload**: Code changes automatically reload in the app
2. **Debugging**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu
3. **Console Logs**: Use Expo DevTools or React Native Debugger
4. **TypeScript**: Fix type errors before running the app

## Building for Production

### iOS (requires Mac and Apple Developer account):
```bash
eas build --platform ios
```

### Android:
```bash
eas build --platform android
```

You'll need to set up EAS (Expo Application Services) for production builds.

## Environment Variables

- `API_URL`: Backend API base URL (required)

## Notes

- Camera permissions required for QR scanning
- Photo library access needed for image uploads
- Internet connection required for all features
- Minimum iOS 13.0 or Android 6.0

## Support

For issues or questions:
1. Check the README in the root directory
2. Review backend service documentation
3. Ensure all services are running
4. Check network connectivity
