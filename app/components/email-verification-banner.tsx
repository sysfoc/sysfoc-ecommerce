"use client"

import { useState } from "react"
import { sendEmailVerification } from "firebase/auth"
import { useAuth } from "../../lib/clientAuth"

export default function EmailVerificationBanner() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Don't show banner if user is not logged in, email is verified, or signed in with Google
  if (!user || user.emailVerified || user.providerData.some((p) => p.providerId === "google.com")) {
    return null
  }

  const handleSendVerification = async () => {
    if (!user) return

    setSending(true)
    try {
      await sendEmailVerification(user)
      setSent(true)
    } catch (error) {
      console.error("Failed to send verification email:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
      <div className="flex items-center justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              {sent
                ? "Verification email sent! Check your inbox and click the link to verify your email."
                : "Please verify your email address to secure your account and enable all features."}
            </p>
          </div>
        </div>
        {!sent && (
          <div className="flex-shrink-0">
            <button
              onClick={handleSendVerification}
              disabled={sending}
              className="bg-yellow-100 dark:bg-yellow-800 px-3 py-1 rounded text-sm text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Verification"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
