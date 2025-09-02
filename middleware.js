import { NextResponse } from "next/server"

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Only protect /account routes
  if (pathname.startsWith("/account")) {
    try {
      // Check for Firebase auth token in cookies
      const sessionCookie = request.cookies.get("__session")

      // If no session cookie, redirect to sign-in
      if (!sessionCookie) {
        return NextResponse.redirect(new URL("/sign-in", request.url))
      }

      // For additional security, we could verify the session here
      // but for simplicity, we'll rely on client-side auth state
      // and API route protection
    } catch (error) {
      console.error("Middleware auth check failed:", error)
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*"],
}
