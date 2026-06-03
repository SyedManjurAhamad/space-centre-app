# React Native Mobile App - Setup Guide

## 📱 Space Centre Attendance - Mobile App

A fully functional React Native mobile application for Space Centre attendance tracking with OTP verification.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android) OR Xcode (for iOS)
- Android SDK or iOS SDK

## 📦 Installation

### 1. Navigate to mobile directory
```bash
cd mobile
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Install pods (iOS only)
```bash
cd ios
pod install
cd ..
```

## 🔧 Configuration

### Update API URL
Edit the API URL in these files to point to your backend server:
- `mobile/App.js` - Change `API_URL`
- `mobile/screens/auth/LoginScreen.js` - Change `API_URL`
- `mobile/screens/auth/OTPVerificationScreen.js` - Change `API_URL`
- `mobile/screens/auth/RegisterScreen.js` - Change `API_URL`
- `mobile/screens/main/DashboardScreen.js` - Change `API_URL`
- `mobile/screens/main/CheckInScreen.js` - Change `API_URL`
- `mobile/screens/main/HistoryScreen.js` - Change `API_URL`

Change from:
```javascript
const API_URL = 'http://192.168.x.x:5000';
```

To your actual backend URL:
```javascript
const API_URL = 'http://your-backend-ip:5000';
// or for production
const API_URL = 'https://your-domain.com';
```

## 🚀 Running the App

### Android
```bash
npm run android
# or
react-native run-android
```

### iOS
```bash
npm run ios
# or
react-native run-ios
```

### Start Metro Bundler
```bash
npm start
```

## 📁 Project Structure

```
mobile/
├── App.js                          # Main app with navigation
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js         # Login with OTP
│   │   ├── RegisterScreen.js      # Student/Staff registration
│   │   └── OTPVerificationScreen.js # OTP verification
│   ├── main/
│   │   ├── DashboardScreen.js     # Main dashboard
│   │   ├── CheckInScreen.js       # Check-in functionality
│   │   ├── HistoryScreen.js       # Attendance history
│   │   └── ProfileScreen.js       # User profile
│   └── SplashScreen.js            # Splash screen
├── services/
│   └── api.js                     # API client
└── package.json                   # Dependencies
```

## 🎯 Features

### Authentication
- ✅ User registration (Student/Staff)
- ✅ Email/Password login
- ✅ OTP verification (Email/SMS)
- ✅ JWT token management
- ✅ Persistent login with AsyncStorage

### Main Features
- ✅ Real-time dashboard with stats
- ✅ Location-based check-in
- ✅ OTP verification for check-in
- ✅ Quick check-out
- ✅ Attendance history with filtering
- ✅ User profile management
- ✅ WebSocket real-time updates

### UI/UX
- ✅ Bottom tab navigation
- ✅ Beautiful card-based design
- ✅ Icon-based UI (Ionicons)
- ✅ Smooth animations
- ✅ Pull-to-refresh
- ✅ Loading states
- ✅ Error handling with alerts

## 📲 Screen Details

### Login Screen
- Email and password input
- OTP method selection (Email/SMS)
- Eye icon to toggle password visibility
- Link to registration

### Registration Screen
- Student/Staff toggle
- Department selection
- Roll number/Staff ID fields
- Password confirmation
- All required validations

### Dashboard Screen
- User greeting with unique ID
- 4 stat cards (check-ins, checked in, completed, avg duration)
- Quick action buttons (Check In, Check Out, History)
- Helpful tips
- Pull-to-refresh

### Check-In Screen
- Location dropdown selector
- 2-step process: Location → OTP Verification
- Large OTP input with letter spacing
- Back button to change location

### History Screen
- FlatList of attendance records
- Status indicators (completed/pending)
- Time breakdown (Check-in, Check-out, Duration)
- Location display
- Empty state

### Profile Screen
- User profile header
- Unique ID display
- Email, Department, User Type
- Settings options
- Logout button

## 🔌 API Integration

### Backend Connection
The mobile app connects to your backend API. Make sure:
1. Backend server is running on the specified URL
2. CORS is enabled for mobile clients
3. Firebase/Twilio credentials are configured for OTP

### Socket.io Real-time Updates
```javascript
const socket = io('YOUR_API_URL/attendance', {
  auth: { token },
});

socket.on('attendance-update', (data) => {
  // Update stats automatically
});
```

## 🛠️ Troubleshooting

### App won't start
```bash
# Clear cache
npm cache clean --force
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
npm run android
```

### API connection error
- Check backend URL in all files
- Ensure backend server is running
- Check network connectivity
- Verify firewall settings

### OTP not received
- Check Twilio/Gmail credentials in backend
- Verify phone number format
- Check email spam folder

### AsyncStorage errors
- Install AsyncStorage: `npm install @react-native-async-storage/async-storage`
- Link native modules: `react-native link`

## 📱 Device Testing

### On Physical Device
1. Enable USB debugging
2. Connect device via USB
3. Run: `react-native run-android` or `react-native run-ios`

### Using Emulator
- Android: Open Android Studio → AVD Manager → Start emulator
- iOS: Xcode → Devices and Simulators → Select simulator

## 📦 Building for Production

### Android APK
```bash
cd android
./gradlew assembleRelease
# APK located at: android/app/build/outputs/apk/release/app-release.apk
```

### iOS Build
```bash
cd ios
xcodebuild -workspace SpaceCentreAttendance.xcworkspace -scheme SpaceCentreAttendance -configuration Release
```

## 🔐 Security

- Tokens stored in AsyncStorage
- HTTPS in production
- OTP expires in 5 minutes
- Max 3 OTP verification attempts
- Password hashing on backend
- JWT token validation

## 📊 Performance

- Optimized re-renders
- Efficient API calls
- Image caching
- List virtualization (FlatList)
- Memory leak prevention
- Network error handling

## 🆘 Support

For issues or questions:
1. Check the console logs: `react-native log-android` or `react-native log-ios`
2. Enable verbose logging
3. Review backend logs
4. Check network requests in Flipper debugger

## 📝 Dependencies

```json
{
  "react-native": "0.72.0",
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/bottom-tabs": "^6.5.8",
  "axios": "^1.6.0",
  "socket.io-client": "^4.6.1",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "react-native-vector-icons": "^10.0.0"
}
```

## 📄 License

MIT License - See LICENSE file

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: Production Ready
