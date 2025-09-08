// contexts/UserContext.js
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, updateProfile } from "firebase/auth"
import { auth } from "../../lib/firebaseClient"

const UserContext = createContext({})

export function UserProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user profile from your MongoDB
  const fetchUserProfile = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken()
      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setDbUser(userData)
      } else {
        console.error("Failed to fetch user profile")
        setDbUser(null)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setError("Failed to load user profile")
      setDbUser(null)
    }
  }

  // Sync user with your MongoDB
  const syncUser = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken()
      
      // Set session cookie
      document.cookie = `__session=${token}; path=/; max-age=3600; secure; samesite=strict`

      const response = await fetch("/api/users/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // After sync, fetch the full profile
        await fetchUserProfile(firebaseUser)
      }
    } catch (error) {
      console.error("User sync failed:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      setError(null)

      if (firebaseUser) {
        await syncUser(firebaseUser)
      } else {
        setDbUser(null)
        // Clear session cookie
        document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Role-based access control functions
  const hasRole = (role) => {
    return dbUser?.role === role
  }

  const isAdmin = () => {
    return dbUser?.role === "admin"
  }

  const isUser = () => {
    return dbUser?.role === "user"
  }

  const canAccess = (requiredRoles = []) => {
    if (!dbUser || !dbUser.role) return false
    return requiredRoles.includes(dbUser.role)
  }

  // User status checks
  const isActive = () => {
    return dbUser?.is_active === true
  }

  const isBanned = () => {
    return dbUser?.is_banned === true
  }

  const isEmailVerified = () => {
    return dbUser?.email_verified === true
  }

  // User actions
  const refreshUser = async () => {
    if (firebaseUser) {
      await fetchUserProfile(firebaseUser)
    }
  }

 const updateUserProfile = async (updates) => {
  if (!firebaseUser) return { success: false, error: "Not authenticated" };

  try {
    // Update Firebase profile if name is being changed
    if (updates.name && updates.name !== firebaseUser.displayName) {
      await updateProfile(firebaseUser, {
        displayName: updates.name
      });
    }

    const token = await firebaseUser.getIdToken();
    const response = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setDbUser(updatedUser);
      return { success: true, data: updatedUser };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Update failed" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

      const contextValue = {
    // User data
    firebaseUser,
    dbUser,
    user: dbUser, // Alias for convenience
    loading,
    error,

    // Authentication state
    isAuthenticated: !!firebaseUser && !!dbUser,
    isLoading: loading,

    // Role-based access
    hasRole,
    isAdmin,
    isUser,
    canAccess,

    // Status checks
    isActive,
    isBanned,
    isEmailVerified,

    // Actions
    refreshUser,
    updateUserProfile,

    // User properties for easy access
    uid: dbUser?.uid,
    email: dbUser?.email,
    name: dbUser?.name,
    role: dbUser?.role,
    avatar: dbUser?.avatar_url,
    phone: dbUser?.phone,
    cart: dbUser?.cart || [],
    wishlist: dbUser?.wishlist || [],
    addresses: dbUser?.addresses || [],
    orderCount: dbUser?.order_count || 0,
    totalSpent: dbUser?.total_spent || 0,
    customerSince: dbUser?.customer_since,
    preferences: {
      currency: dbUser?.preferred_currency || "USD",
      locale: dbUser?.preferred_locale || "en-US",
      timezone: dbUser?.timezone || "UTC",
      marketing: dbUser?.marketing_opt_in || false,
      emailNotifications: dbUser?.email_notifications !== false,
      smsNotifications: dbUser?.sms_notifications || false,
    }
  }

  // Debug log context values
  console.log("🔍 Context values:", {
    firebaseUser: !!firebaseUser,
    dbUser: !!dbUser,
    isAuthenticated: !!firebaseUser && !!dbUser,
    loading,
    name: dbUser?.name,
    email: dbUser?.email,
    avatar: dbUser?.avatar_url
  })

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// Higher-order component for role-based access
export function withRoleAccess(WrappedComponent, requiredRoles = [], options = {}) {
  const {
    fallback = null,
    redirect = null,
    showLoading = true
  } = options

  return function RoleProtectedComponent(props) {
    const { canAccess, isAuthenticated, loading, isActive, isBanned } = useUser()

    if (loading && showLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      if (redirect) {
        if (typeof window !== "undefined") {
          window.location.href = redirect
        }
        return null
      }
      return fallback || <div>Access denied: Authentication required</div>
    }

    if (isBanned()) {
      return <div>Account suspended. Please contact support.</div>
    }

    if (!isActive()) {
      return <div>Account inactive. Please contact support.</div>
    }

    if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
      return fallback || <div>Access denied: Insufficient permissions</div>
    }

    return <WrappedComponent {...props} />
  }
}

// Hook for conditional rendering based on roles
export function useRoleAccess(requiredRoles = []) {
  const { canAccess, isAuthenticated, isActive, isBanned } = useUser()
  
  return {
    hasAccess: isAuthenticated && isActive() && !isBanned() && (requiredRoles.length === 0 || canAccess(requiredRoles)),
    isAuthenticated,
    isActive: isActive(),
    isBanned: isBanned()
  }
}