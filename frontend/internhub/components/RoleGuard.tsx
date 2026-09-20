"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUserPayload, canAccessRoute, getRoleBasedDashboard, isAuthenticated, clearAuth } from '@/lib/roleGuard'
import { Loader2, ShieldAlert } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallbackPath?: string
}

export default function RoleGuard({ children, allowedRoles, fallbackPath }: RoleGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [pathname])

  const checkAccess = () => {
    setIsChecking(true)

    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log('🔒 Not authenticated, redirecting to login')
      clearAuth()
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    const userPayload = getUserPayload()
    if (!userPayload) {
      console.log('🔒 Invalid token, redirecting to login')
      clearAuth()
      router.push('/auth/login')
      return
    }

    const userRole = userPayload.role

    // If specific roles are required, check them
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole)) {
        console.log(`🔒 Access denied: User role "${userRole}" not in allowed roles [${allowedRoles.join(', ')}]`)
        const correctDashboard = getRoleBasedDashboard(userRole)
        
        // Show a brief message before redirect (don't clear auth, just redirect)
        setHasAccess(false)
        setTimeout(() => {
          router.push(fallbackPath || correctDashboard)
        }, 1500)
        return
      }
    }

    // Check if user can access the current route
    if (!canAccessRoute(pathname)) {
      console.log(`🔒 Access denied: User role "${userRole}" cannot access ${pathname}`)
      const correctDashboard = getRoleBasedDashboard(userRole)
      
      // Show a brief message before redirect (don't clear auth, just redirect)
      setHasAccess(false)
      setTimeout(() => {
        router.push(fallbackPath || correctDashboard)
      }, 1500)
      return
    }

    console.log(`✅ Access granted: User role "${userRole}" can access ${pathname}`)
    setHasAccess(true)
    setIsChecking(false)
  }

  // Show loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Show access denied message
  if (!hasAccess) {
    const userPayload = getUserPayload()
    const userRole = userPayload?.role || 'unknown'
    const correctDashboard = getRoleBasedDashboard(userRole)

    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Your role:</strong> {userRole}
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              This page requires a different role to access.
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting you to your dashboard...
          </p>
          <button
            onClick={() => router.push(correctDashboard)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}
