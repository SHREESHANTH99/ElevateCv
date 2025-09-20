# Firebase Google Authentication Setup Guide

This guide will help you set up Google authentication using Firebase for your TailorCV application.

## 🔥 Firebase Project Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name: `tailorcv` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create the project

### 2. Enable Authentication

1. In your Firebase project dashboard, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Enable it and add your support email
6. Click "Save"

### 3. Configure Firebase Web App

1. In project settings (gear icon), go to "General" tab
2. Scroll down to "Your apps" section
3. Click on the "</>" (Web) icon
4. Register your app with name: `TailorCV Web`
5. Copy the Firebase configuration object

### 4. Set up Authentication Domain

1. In Authentication → Settings → Authorized domains
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (when ready)

## 🔧 Environment Configuration

### Frontend Environment Variables

Update your `Frontend/.env` file with your Firebase config:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend API URL
VITE_API_URL=http://localhost:5000
```

### Backend Environment Variables

Update your `Backend/.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_KEY=
```

## 🔐 Service Account Setup (Backend)

### Option 1: Service Account Key (Development)

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **Security Note**: Never commit this file to version control
5. Place the JSON content as a single line in `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

### Option 2: Default Credentials (Production)

For production, use Application Default Credentials (ADC) instead of service account keys.

## 🚀 Running the Application

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Backend

```bash
cd Backend
npm install
npm run dev
```

## ✨ Features Implemented

### Frontend Features

1. **Firebase Configuration**

   - Firebase app initialization
   - Google Auth Provider setup
   - Environment variables support

2. **Authentication Service**

   - Google sign-in with popup
   - User state management
   - Token handling
   - Error handling for various scenarios

3. **Google Login Button Component**

   - Reusable component with variants (signin/signup)
   - Loading states
   - Error display
   - Proper styling with Tailwind CSS

4. **Updated Login/Register Pages**

   - Google login integration
   - Improved UI with dividers
   - Consistent design patterns

5. **Enhanced Auth Context**
   - Google login method
   - Firebase user state synchronization
   - Backend integration

### Backend Features

1. **Firebase Admin SDK Integration**

   - Token verification
   - User management
   - Secure authentication

2. **New API Endpoints**

   - `POST /api/auth/firebase-login`
   - `POST /api/auth/firebase-register`

3. **Updated User Model**

   - Firebase user fields
   - Flexible password requirements
   - Enhanced validation

4. **Authentication Middleware**
   - Firebase token verification
   - User lookup and creation
   - Error handling

## 🔒 Security Features

1. **Token Verification**: All Firebase tokens are verified server-side
2. **User Validation**: Email and UID matching for security
3. **Error Handling**: Comprehensive error messages and logging
4. **Environment Variables**: Secure configuration management

## 🐛 Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/popup-blocked)"**

   - Solution: Allow popups for your domain in browser settings

2. **"Firebase token verification failed"**

   - Check if Firebase project ID is correct
   - Verify service account key is properly set

3. **"User not found" error**

   - This is expected for first-time users
   - They should use the register flow first

4. **CORS issues**
   - Ensure backend CORS is configured for your frontend URL
   - Check Firebase authorized domains

### Development Tips

1. **Test with different Google accounts**
2. **Clear browser cache if experiencing issues**
3. **Check browser console for detailed error messages**
4. **Monitor Firebase Console for authentication events**

## 🔄 Usage Flow

### New User Registration

1. User clicks "Sign up with Google"
2. Google authentication popup appears
3. User selects Google account
4. Frontend receives Firebase token
5. Backend creates new user account
6. User is redirected to dashboard

### Existing User Login

1. User clicks "Sign in with Google"
2. Google authentication popup appears
3. User selects Google account
4. Frontend receives Firebase token
5. Backend validates existing user
6. User is redirected to dashboard

## 📱 Production Considerations

1. **Domain Configuration**: Add production domains to Firebase authorized domains
2. **Service Account Security**: Use proper IAM roles in production
3. **Token Expiration**: Handle token refresh properly
4. **Error Monitoring**: Implement proper logging and monitoring
5. **Rate Limiting**: Already implemented in the backend

## 🎨 UI/UX Features

1. **Loading States**: Visual feedback during authentication
2. **Error Messages**: User-friendly error displays
3. **Responsive Design**: Works on all device sizes
4. **Accessibility**: Proper ARIA labels and keyboard navigation
5. **Consistent Styling**: Matches existing design system

This implementation provides a robust, secure, and user-friendly Google authentication system using Firebase!
