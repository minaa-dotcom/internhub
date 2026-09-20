/**
 * Role Guard Utility
 * 
 * Provides functions to check user roles and protect routes
 */

export interface UserPayload {
  id: string
  email: string
  role: 'university' | 'company' | 'student' | 'admin'
  organization_name?: string
  exp?: number
}

/**
 * Decode JWT token to get user payload
 */
export function decodeToken(token: string): UserPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Get user role from stored token
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
  if (!token) return null
  
  const payload = decodeToken(token)
  return payload?.role || null
}

/**
 * Get full user payload from stored token
 */
export function getUserPayload(): UserPayload | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
  if (!token) return null
  
  return decodeToken(token)
}

/**
 * Check if token is expired
 * Returns false if no expiration or token is still valid
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeToken(token)
    if (!payload) return true
    
    // If no expiration is set, consider token valid
    if (!payload.exp) return false
    
    const currentTime = Math.floor(Date.now() / 1000)
    // Add a 5 minute buffer before considering expired
    const bufferTime = 5 * 60
    return payload.exp < (currentTime - bufferTime)
  } catch (error) {
    return true
  }
}

/**
 * Check if user has any of the allowed roles
 */
export function hasRole(allowedRoles: string[]): boolean {
  const userRole = getUserRole()
  if (!userRole) return false
  
  return allowedRoles.includes(userRole)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
  if (!token) return false
  
  return !isTokenExpired(token)
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedDashboard(role: string): string {
  switch (role) {
    case 'university':
      return '/dashboard/university'
    case 'company':
      return '/dashboard/company'
    case 'admin':
      return '/dashboard/admin'
    case 'student':
      return '/dashboard/student'
    default:
      return '/auth/login'
  }
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(pathname: string): boolean {
  const userRole = getUserRole()
  if (!userRole) return false
  
  // Admin can access everything
  if (userRole === 'admin') return true
  
  // Check role-specific routes
  if (pathname.startsWith('/dashboard/university')) {
    return userRole === 'university'
  }
  
  if (pathname.startsWith('/dashboard/company')) {
    return userRole === 'company'
  }
  
  if (pathname.startsWith('/dashboard/student')) {
    return userRole === 'student'
  }
  
  if (pathname.startsWith('/dashboard/admin')) {
    return userRole === 'admin'
  }
  
  // Allow other routes
  return true
}

/**
 * Clear authentication data
 */
export function clearAuth() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  sessionStorage.clear()
}
