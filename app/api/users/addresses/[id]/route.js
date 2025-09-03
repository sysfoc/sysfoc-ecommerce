// app/api/users/addresses/[id]/route.js
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
    const { 
      type, // Add this
      label, 
      full_name, 
      phone, 
      line1, 
      line2, 
      city, 
      state, 
      postal_code, 
      country, 
      is_default_shipping, 
      is_default_billing 
    } = body
    const { id: addressId } = await params

    // Find user and update address
    const user = await User.findOne({ uid: decodedToken.uid })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    const currentAddress = user.addresses[addressIndex];
    
    // Prevent changing type from billing to shipping if another billing exists
    if (currentAddress.type === 'billing' && type === 'shipping') {
      const otherBillingExists = user.addresses.some(
        (addr, index) => index !== addressIndex && addr.type === 'billing'
      );
      
      if (otherBillingExists) {
        return NextResponse.json(
          { error: "Cannot change billing address to shipping. Another billing address exists." }, 
          { status: 400 }
        );
      }
    }

    // Handle defaults
    if (type === 'shipping' && is_default_shipping) {
      user.addresses.forEach((addr, index) => {
        if (addr.type === 'shipping' && index !== addressIndex) {
          addr.is_default_shipping = false
        }
      })
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      type,
      label,
      full_name,
      phone,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      is_default_shipping: type === 'shipping' ? (is_default_shipping || false) : false,
      is_default_billing: type === 'billing' || is_default_billing || false,
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

    const { id } = params; // Get the address ID from params

    // Find user
    const user = await User.findOne({ uid: decodedToken.uid })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the address index
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === id)
    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Remove the address
    user.addresses.splice(addressIndex, 1)
    await user.save()

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Delete address error:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}