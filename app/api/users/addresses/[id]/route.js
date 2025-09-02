import { NextResponse } from "next/server"
import { verifyIdToken } from "../../../../../lib/firebaseAdmin"
import connectDB from "../../../../../lib/db"
import User from "../../../../models/User"

export async function PUT(request, { params }) {
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
    const { id: addressId } = await params

    // Find user and update address FIRST
    const user = await User.findOne({ uid: decodedToken.uid })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // THEN handle defaults
    if (is_default_shipping) {
      user.addresses.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.is_default_shipping = false
        }
      })
    }
    if (is_default_billing) {
      user.addresses.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.is_default_billing = false
        }
      })
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
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

    await user.save()

    return NextResponse.json({ message: "Address updated successfully", user })
  } catch (error) {
    console.error("Update address error:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await verifyIdToken(token)

    await connectDB()

    const { id: addressId } = await params

    // Find user and remove address
    const user = await User.findOne({ uid: decodedToken.uid })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    user.addresses.splice(addressIndex, 1)
    await user.save()

    return NextResponse.json({ message: "Address deleted successfully", user })
  } catch (error) {
    console.error("Delete address error:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
