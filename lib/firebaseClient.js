import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

console.log("[v0] Firebase env vars:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "SET" : "MISSING",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "SET" : "MISSING",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "SET" : "MISSING",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "SET" : "MISSING",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "SET" : "MISSING",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "SET" : "MISSING",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? "SET" : "MISSING",
})

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
