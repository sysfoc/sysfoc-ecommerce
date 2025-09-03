import { NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth.js";
import connectDB from "../../../../lib/db.js";
import User from "../../../models/User.js";

export async function GET(request) {
  try {
    const token = getIdTokenFromHeader(request);

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { login_history, signup_ip, ...userProfile } = user.toObject();
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return NextResponse.json(
      { error: "Profile fetch failed" },
      { status: 500 }
    );
  }
}
