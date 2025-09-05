"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebaseClient.js"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        // Set a simple session cookie for middleware
        try {
          const token = await firebaseUser.getIdToken()
          document.cookie = `__session=${token}; path=/; max-age=3600; secure; samesite=strict`
        } catch (error) {
          console.error("Failed to set session cookie:", error)
        }
      } else {
        setUser(null)
        // Clear session cookie
        document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}

