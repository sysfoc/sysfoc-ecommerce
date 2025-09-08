// app/api/users/sync/route.js
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

    let additionalData = {}
    try {
      const body = await request.json()
      additionalData = body || {}
    } catch (error) {
      // No body or invalid JSON, continue with empty object
    }

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
      // Core Firebase fields (always updated) - ONLY these fields
      user.email = decodedToken.email
      user.email_verified = decodedToken.email_verified || false
      user.avatar_url = decodedToken.picture || user.avatar_url
      user.last_login_ip = clientIp
      user.last_login_at = now

      // DO NOT override user-editable fields like name, phone, email_notifications, marketing_opt_in
      // These should only be updated through the profile update API

      // Exclude system fields that shouldn't be user-editable
      const protectedFields = [
        "uid",
        "signup_method",
        "provider_ids",
        "signup_ip",
        "signup_at",
        "login_history",
        "created_at",
        "updated_at",
        "name", // Added - don't sync name from Firebase
        "phone", // Added - don't sync phone from Firebase
        "email_notifications", // Added - don't sync from Firebase
        "marketing_opt_in", // Added - don't sync from Firebase
      ]

      Object.keys(additionalData).forEach((key) => {
        if (!protectedFields.includes(key) && additionalData[key] !== undefined) {
          user[key] = additionalData[key]
        }
      })

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
      // Create new user - only use Firebase data for initial creation
      const nameParts = (decodedToken.name || "").split(" ")

      const newUserData = {
        // Identity
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified || false,
        name: decodedToken.name,
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        avatar_url: decodedToken.picture,
        phone: decodedToken.phone || "",

        // Auth meta
        signup_method: signupMethod,
        provider_ids: providerIds,

        // Status
        role: "user",
        is_active: true,
        is_banned: false,

        // Preferences
        preferred_currency: "USD",
        preferred_locale: "en-US",
        timezone: "UTC",
        marketing_opt_in: false,

        // Shopping & Orders
        cart: [],
        wishlist: [],
        order_count: 0,
        total_spent: 0,

        // Customer Preferences
        email_notifications: true,
        sms_notifications: false,

        // Customer Status
        customer_since: now,
        last_order_at: null,

        // Addresses
        addresses: [],

        // Defaults
        default_shipping_address_id: null,
        default_billing_address_id: null,

        // IP & audit
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

        // Override with any additional data provided (excluding protected fields)
        ...Object.keys(additionalData).reduce((acc, key) => {
          const protectedFields = ["uid", "signup_method", "provider_ids", "signup_ip", "signup_at", "login_history"]
          if (!protectedFields.includes(key) && additionalData[key] !== undefined) {
            acc[key] = additionalData[key]
          }
          return acc
        }, {}),
      }

      user = new User(newUserData)
      await user.save()
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error("User sync failed:", error)
    return NextResponse.json({ error: "User sync failed" }, { status: 500 })
  }
}