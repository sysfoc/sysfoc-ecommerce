import { NextResponse } from "next/server"
import { getIdTokenFromHeader, verifyIdToken, getClientIp } from "../../../../lib/auth"
import connectDB from "../../../../lib/db"
import User from "../../../models/User"

export async function POST(request) {
  try {
    const token = getIdTokenFromHeader(request)

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decodedToken = await verifyIdToken(token)

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const clientIp = getClientIp(request)
    const now = new Date()

    // Determine signup method
    let signupMethod = "password"
    let providerIds = ["password"]

    if (decodedToken.firebase?.sign_in_provider === "google.com") {
      signupMethod = "google"
      providerIds = ["google.com"]
    }

    // Check if user exists
    let user = await User.findOne({ uid: decodedToken.uid })

    if (user) {
      // Update existing user
      user.email = decodedToken.email
      user.email_verified = decodedToken.email_verified || false
      user.name = decodedToken.name || user.name
      user.avatar_url = decodedToken.picture || user.avatar_url
      user.last_login_ip = clientIp
      user.last_login_at = now

      // Add to login history
      user.login_history.push({
        at: now,
        ip: clientIp,
        method: decodedToken.firebase?.sign_in_provider === "google.com" ? "google" : "password",
      })

      // Keep only last 50 login entries
      if (user.login_history.length > 50) {
        user.login_history = user.login_history.slice(-50)
      }

      await user.save()
    } else {
      // Create new user
      const nameParts = (decodedToken.name || "").split(" ")

      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified || false,
        name: decodedToken.name,
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        avatar_url: decodedToken.picture,
        signup_method: signupMethod,
        provider_ids: providerIds,
        signup_ip: clientIp,
        last_login_ip: clientIp,
        last_login_at: now,
        login_history: [
          {
            at: now,
            ip: clientIp,
            method: decodedToken.firebase?.sign_in_provider === "google.com" ? "google" : "password",
          },
        ],
      })

      await user.save()
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("User sync failed:", error)
    return NextResponse.json({ error: "User sync failed" }, { status: 500 })
  }
}
