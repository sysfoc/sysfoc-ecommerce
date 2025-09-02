import { NextResponse } from "next/server"
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth.js"

export async function GET(request) {
  try {
    const token = getIdTokenFromHeader(request)

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decodedToken = await verifyIdToken(token)

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Return minimal session data
    return NextResponse.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    })
  } catch (error) {
    console.error("Session verification failed:", error)
    return NextResponse.json({ error: "Session verification failed" }, { status: 500 })
  }
}
