"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { applyActionCode } from "firebase/auth"
import { auth } from "../../lib/firebaseClient"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      // Get URL parameters manually for better debugging
      const urlParams = new URLSearchParams(window.location.search)
      const actionCode = urlParams.get("oobCode")
      const mode = urlParams.get("mode")

      console.log("[DEBUG] Current URL:", window.location.href)
      console.log("[DEBUG] URL search params:", window.location.search)
      console.log("[DEBUG] Parsed params:", {
        actionCode: actionCode ? actionCode.substring(0, 10) + "..." : null,
        mode: mode
      })

      // Log all available parameters for debugging
      const allParams = {}
      urlParams.forEach((value, key) => {
        allParams[key] = key === 'oobCode' ? value.substring(0, 10) + '...' : value
      })
      console.log("[DEBUG] All URL parameters:", allParams)

      if (!actionCode) {
        console.log("[DEBUG] No action code found")
        setStatus("error")
        setMessage("Invalid verification link - no action code found. Please check that you clicked the complete link from your email.")
        return
      }

      if (mode !== "verifyEmail") {
        console.log("[DEBUG] Invalid mode:", mode)
        setStatus("error")
        setMessage(`Invalid verification link - expected 'verifyEmail' but got '${mode}'`)
        return
      }

      try {
        console.log("[DEBUG] Attempting to apply action code...")
        await applyActionCode(auth, actionCode)
        console.log("[DEBUG] Email verification successful!")

        setStatus("success")
        setMessage("Email verified successfully! You can now use all features of your account.")

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } catch (error) {
        console.error("[DEBUG] Email verification failed:", error)
        setStatus("error")

        // Provide more specific error messages
        switch (error.code) {
          case "auth/invalid-action-code":
            setMessage("This verification link is invalid or has already been used.")
            break
          case "auth/expired-action-code":
            setMessage("This verification link has expired. Please request a new verification email.")
            break
          case "auth/user-disabled":
            setMessage("This user account has been disabled.")
            break
          case "auth/user-not-found":
            setMessage("No user account found for this verification link.")
            break
          default:
            setMessage(`Verification failed: ${error.message}`)
        }
      }
    }

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(verifyEmail, 100)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verifying Email...</h1>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your email address.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Email Verified!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting you to the homepage in 3 seconds...</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Homepage Now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verification Failed</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/sign-in")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Create New Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}