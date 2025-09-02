"use client"

import { useEffect } from "react"
import { signOut } from "firebase/auth"
import { auth } from "../../lib/firebaseClient.js"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut(auth)
        router.push("/")
      } catch (error) {
        console.error("Logout failed:", error)
        router.push("/")
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  )
}
