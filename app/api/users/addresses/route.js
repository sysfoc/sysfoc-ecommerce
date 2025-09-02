import { NextResponse } from "next/server"
import { verifyIdToken } from "../../../../lib/firebaseAdmin"
import connectDB from "../../../../lib/db"
import User from "../../../models/User"

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await verifyIdToken(token)

    await connectDB()

    const body = await request.json()
    const { label, full_name, phone, line1, line2, city, state, postal_code, country, is_default_shipping, is_default_billing } = body

    // Find user and add new address
    const user = await User.findOne({ uid: decodedToken.uid })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newAddress = {
  label,
  full_name,
  phone,
  line1,
  line2,
  city,
  state,
  postal_code,
  country,
  is_default_shipping: is_default_shipping || false,
  is_default_billing: is_default_billing || false,
}

  if (is_default_shipping) {
  user.addresses.forEach((addr) => {
    addr.is_default_shipping = false
  })
}
if (is_default_billing) {
  user.addresses.forEach((addr) => {
    addr.is_default_billing = false
  })
}

    user.addresses.push(newAddress)
    await user.save()

    return NextResponse.json({ message: "Address added successfully", user })
  } catch (error) {
    console.error("Add address error:", error)
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 })
  }
}
