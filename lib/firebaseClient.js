import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

if (!firebaseConfig.apiKey) {
  throw new Error(
    "Firebase API key is missing. Check your .env file and make sure NEXT_PUBLIC_FIREBASE_API_KEY is set.",
  )
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Configure Google provider for additional scopes if needed
googleProvider.addScope('email')
googleProvider.addScope('profile')

// Set custom parameters for Google OAuth
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Action code settings for email verification
export const getActionCodeSettings = (baseUrl) => ({
  url: `${baseUrl}/verify-email`,
  handleCodeInApp: true,
})

// Default action code settings
export const actionCodeSettings = {
  url: typeof window !== "undefined" ? `${window.location.origin}/verify-email` : "http://localhost:3000/verify-email",
  handleCodeInApp: true,
}

// Use device language for verification emails
if (typeof navigator !== "undefined") {
  auth.settings.languageCode = navigator.language
}

// Enable persistence for better user experience
if (typeof window !== "undefined") {
  auth.settings.appVerificationDisabledForTesting = false
}