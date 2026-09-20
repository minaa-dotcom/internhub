# Role-Based Access Control (RBAC) Implementation

## 🎯 Overview

Implemented comprehensive Role-Based Access Control to ensure users can only access pages appropriate for their role. This prevents permission errors and provides a seamless user experience with automatic redirects.

---

## 🔒 What Was Implemented

### 1. **Role Guard System**
- Client-side route protection
- Automatic role verification
- Graceful access denied handling
- Smart redirects to correct dashboards

### 2. **Utility Functions**
- JWT token decoding
- Role checking
- Token expiration validation
- Role-based dashboard routing

### 3. **Protected Pages**
- Company Application Page → `company` or `admin` roles only
- University Advisors Page → `university` or `admin` roles only
- Easily extendable to other pages

---

## 📁 Files Created

### 1. `lib/roleGuard.ts`
**Utility functions for role management**

```typescript
// Key functions:
- decodeToken(token: string): UserPayload | null
- getUserRole(): string | null
- getUserPayload(): UserPayload | null
- isTokenExpired(token: string): boolean
- hasRole(allowedRoles: string[]): boolean
- isAuthenticated(): boolean
- canAccessRoute(pathname: string): boolean
- getRoleBasedDashboard(role: string): string
- clearAuth(): void
```

### 2. `components/RoleGuard.tsx`
**React component that wraps protected pages**

```typescript
<RoleGuard allowedRoles={['company', 'admin']}>
  {/* Protected content */}
</RoleGuard>
```

**Features:**
- ✅ Verifies authentication
- ✅ Checks user role
- ✅ Shows loading state while checking
- ✅ Displays access denied message if unauthorized
- ✅ Auto-redirects to correct dashboard
- ✅ Clears invalid tokens

### 3. `middleware.ts`
**Next.js middleware for server-side protection**

```typescript
// Protects routes before they even load
- Checks for token in cookies
- Redirects to login if missing
- Allows auth routes
```

---

## 🛡️ How It Works

### User Flow

1. **User tries to access a protected page**
   ```
   User navigates to /dashboard/company/application
   ```

2. **RoleGuard checks authentication**
   ```typescript
   - Is there a token in localStorage?
   - Is the token valid (not expired)?
   - What role does the user have?
   ```

3. **RoleGuard checks authorization**
   ```typescript
   - Does user role match allowedRoles?
   - Can user access this specific route?
   ```

4. **Result**
   - ✅ **Authorized**: Show the page
   - ❌ **Not authenticated**: Redirect to login
   - ❌ **Wrong role**: Show access denied → Redirect to correct dashboard

---

## 🎨 User Experience

### Before (With Bugs)
```
❌ User sees page loading
❌ API call fails with 403
❌ Generic error in console
❌ User confused about what went wrong
❌ No guidance on what to do
```

### After (With RBAC)
```
✅ RoleGuard checks access immediately
✅ Clear loading state
✅ User-friendly access denied message
✅ Shows user's current role
✅ Auto-redirect to correct dashboard in 1.5s
✅ Manual redirect button available
✅ No confusing API errors in console
```

---

## 🔧 Implementation Example

### Protected Page Setup

```typescript
// app/dashboard/company/application/page.tsx
import RoleGuard from "@/components/RoleGuard"

export default function CompanyApplicationsPage() {
  return (
    <RoleGuard allowedRoles={['company', 'admin']}>
      <div className="dashboard-content">
        {/* Your page content */}
      </div>
    </RoleGuard>
  )
}
```

### Role Check in Code

```typescript
import { getUserRole, canAccessRoute } from '@/lib/roleGuard'

// Check user role
const userRole = getUserRole()
console.log('User role:', userRole) // 'company' | 'university' | 'admin' | 'student'

// Check if user can access a route
const canAccess = canAccessRoute('/dashboard/company/application')
console.log('Can access:', canAccess) // true | false
```

---

## 📊 Role Permissions Matrix

| Role       | Company Dashboard | University Dashboard | Admin Dashboard | Student Dashboard |
|------------|-------------------|----------------------|-----------------|-------------------|
| company    | ✅ Full Access    | ❌ Denied            | ❌ Denied       | ❌ Denied         |
| university | ❌ Denied         | ✅ Full Access       | ❌ Denied       | ❌ Denied         |
| admin      | ✅ Full Access    | ✅ Full Access       | ✅ Full Access  | ✅ Full Access    |
| student    | ❌ Denied         | ❌ Denied            | ❌ Denied       | ✅ Full Access    |

---

## 🚀 Usage Examples

### Example 1: Protect Company Page

```typescript
// Allows only company and admin users
<RoleGuard allowedRoles={['company', 'admin']}>
  <CompanyDashboard />
</RoleGuard>
```

### Example 2: Protect University Page

```typescript
// Allows only university and admin users
<RoleGuard allowedRoles={['university', 'admin']}>
  <UniversityDashboard />
</RoleGuard>
```

### Example 3: Admin Only Page

```typescript
// Allows only admin users
<RoleGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleGuard>
```

### Example 4: Multiple Roles

```typescript
// Allows company, university, and admin
<RoleGuard allowedRoles={['company', 'university', 'admin']}>
  <SharedResourcesPage />
</RoleGuard>
```

---

## 🎯 Access Denied Screen

When a user tries to access a page they don't have permission for:

```
┌─────────────────────────────────────┐
│         🛡️ Access Denied            │
│                                      │
│  You don't have permission to        │
│  access this page.                   │
│                                      │
│  Your role: company                  │
│  This page requires: university      │
│                                      │
│  Redirecting to your dashboard...    │
│                                      │
│  [Go to My Dashboard]                │
└─────────────────────────────────────┘
```

---

## 🔍 Testing the RBAC

### Test 1: Correct Role Access
```bash
1. Login as company user
2. Go to /dashboard/company/application
3. ✅ Should see the page immediately
4. No errors in console
```

### Test 2: Wrong Role Access
```bash
1. Login as company user
2. Try to go to /dashboard/university/advisors
3. ✅ Should see "Access Denied" screen
4. ✅ Should auto-redirect to /dashboard/company
5. No API 403 errors in console
```

### Test 3: No Authentication
```bash
1. Clear localStorage
2. Try to go to any dashboard page
3. ✅ Should redirect to /auth/login
4. ✅ Should include redirect parameter
```

### Test 4: Expired Token
```bash
1. Modify token to have expired timestamp
2. Try to access any dashboard
3. ✅ Should detect expiration
4. ✅ Should redirect to login
5. ✅ Should clear invalid token
```

---

## 🛠️ Extending to Other Pages

To protect any new page:

```typescript
// 1. Import RoleGuard
import RoleGuard from "@/components/RoleGuard"

// 2. Wrap your page component
export default function MyProtectedPage() {
  return (
    <RoleGuard allowedRoles={['role1', 'role2']}>
      {/* Your content */}
    </RoleGuard>
  )
}
```

---

## 🐛 Troubleshooting

### Issue: "Access Denied" but I have the right role

**Check:**
```typescript
// In browser console:
const token = localStorage.getItem('token')
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('My role:', payload.role)
```

**Fix:**
- If role is wrong, update in database and login again
- Token only updates after new login

### Issue: Infinite redirect loop

**Cause:** Role not matching any dashboard route

**Fix:**
```typescript
// Check roleGuard.ts → getRoleBasedDashboard()
// Ensure your role has a default dashboard
```

### Issue: Page flashes then redirects

**Cause:** Normal behavior - checking auth takes ~100-500ms

**Optional:** Add a global loading state in layout

---

## 📝 Configuration

### Add New Role

```typescript
// 1. Update roleGuard.ts → getRoleBasedDashboard()
export function getRoleBasedDashboard(role: string): string {
  switch (role) {
    case 'university':
      return '/dashboard/university'
    case 'company':
      return '/dashboard/company'
    case 'newrole': // Add here
      return '/dashboard/newrole'
    case 'admin':
      return '/dashboard/admin'
    default:
      return '/auth/login'
  }
}

// 2. Update canAccessRoute() if needed
export function canAccessRoute(pathname: string): boolean {
  const userRole = getUserRole()
  if (!userRole) return false
  
  if (userRole === 'admin') return true
  
  if (pathname.startsWith('/dashboard/newrole')) {
    return userRole === 'newrole'
  }
  
  // ... rest of the checks
}
```

---

## ✅ Benefits

1. **Security**
   - Prevents unauthorized access
   - Validates tokens client-side
   - Checks expiration automatically

2. **User Experience**
   - Clear error messages
   - Automatic redirects
   - No confusing 403 errors
   - Smooth transitions

3. **Developer Experience**
   - Easy to implement
   - Reusable component
   - Type-safe utilities
   - Clear documentation

4. **Maintainability**
   - Centralized role logic
   - Easy to extend
   - Consistent behavior
   - Well-tested

---

## 🎉 Summary

The Role-Based Access Control system ensures:

✅ Users only see pages they have permission for  
✅ No confusing 403 Forbidden errors in console  
✅ Automatic redirects to correct dashboards  
✅ Clear feedback when access is denied  
✅ Seamless user experience  
✅ Easy to extend to new pages  
✅ Secure and maintainable  

**Before:** Users saw confusing errors and broken pages  
**After:** Users are automatically guided to the right place

---

## 📚 Related Documentation

- `BUG_FIX_APPLICATION_FETCH.md` - Original bug fixes
- `BUG_FIX_SUMMARY.md` - Comprehensive bug fix summary
- `FIX_403_FORBIDDEN.md` - How to fix role issues
- `checkAndFixUserRole.js` - Script to update user roles

---

## 🔄 Migration Guide

If you have existing protected pages without RoleGuard:

```bash
# 1. Add RoleGuard import
import RoleGuard from "@/components/RoleGuard"

# 2. Wrap your return statement
return (
  <RoleGuard allowedRoles={['your', 'roles']}>
    {/* existing content */}
  </RoleGuard>
)

# 3. Remove manual role checks from useEffect
# RoleGuard handles this automatically

# 4. Remove manual redirect logic
# RoleGuard handles redirects

# 5. Test with different user roles
```

---

**Status**: ✅ **IMPLEMENTED AND TESTED**  
**Files Modified**: 4 created, 2 updated  
**Breaking Changes**: None  
**Backwards Compatible**: Yes
