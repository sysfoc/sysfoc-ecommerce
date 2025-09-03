import { NextResponse } from "next/server"
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth.js"
import connectDB from "../../../../lib/db.js"
import User from "../../../models/User.js"

const ALLOWED_CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR", "AED"]
const ALLOWED_LOCALES = ["en-US", "en-GB", "ur-PK", "hi-IN", "ar-AE"]
const ALLOWED_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Kolkata",
]

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

    const body = await request.json()
    const { name, phone, preferred_currency, preferred_locale, timezone, email_notifications, marketing_communications } = body

    // Validate input
    if (preferred_currency && !ALLOWED_CURRENCIES.includes(preferred_currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 })
    }

    if (preferred_locale && !ALLOWED_LOCALES.includes(preferred_locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 })
    }

    if (timezone && !ALLOWED_TIMEZONES.includes(timezone)) {
      return NextResponse.json({ error: "Invalid timezone" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ uid: decodedToken.uid })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (name !== undefined) user.name = name
    
    // Handle phone number - add as root level field in User model
    if (phone !== undefined) user.phone = phone
    if (email_notifications !== undefined) user.email_notifications = email_notifications
if (marketing_communications !== undefined) user.marketing_opt_in = marketing_communications
    // Update only the allowed preference fields
    if (preferred_currency) user.preferred_currency = preferred_currency
    if (preferred_locale) user.preferred_locale = preferred_locale
    if (timezone) user.timezone = timezone

    await user.save()

    // Return updated profile data
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      email_verified: user.email_verified,
      name: user.name,
      phone: user.phone, // Include phone in response
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      preferred_currency: user.preferred_currency,
      preferred_locale: user.preferred_locale,
      timezone: user.timezone,
      marketing_communications: user.marketing_opt_in,
      marketing_opt_in: user.marketing_opt_in,
      last_login_at: user.last_login_at,
      last_login_ip: user.last_login_ip,
      created_at: user.created_at,
      updated_at: user.updated_at,
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Profile update failed:", error)
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 })
  }
}
