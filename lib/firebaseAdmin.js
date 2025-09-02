import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
}

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]
export const adminAuth = getAuth(app)

export const verifyIdToken = async (token) => {
  return await adminAuth.verifyIdToken(token)
}