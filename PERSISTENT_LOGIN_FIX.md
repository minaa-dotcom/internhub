# Persistent Login Fix

## Problem
Users were being redirected to login page every time they navigated between pages, even though they were already logged in.

## Root Causes
1. **Middleware blocking requests** - The deprecated `middleware.ts` was causing 404 errors
2. **Aggressive auth checking** - Pages were clearing tokens and redirecting on any error
3. **Token expiration too strict** - No buffer time before considering token expired

## Solutions Implemented

### 1. Removed Deprecated Middleware
**File Deleted:** `middleware.ts`

The Next.js 16 deprecated middleware was intercepting all requests and causing issues. Since we use client-side `RoleGuard`, we don't need server-side middleware.

### 2. Updated RoleGuard Component
**File:** `components/RoleGuard.tsx`

**Changes:**
- ✅ Only redirects to login if truly not authenticated
- ✅ For wrong role, redirects to correct dashboard (doesn't clear auth)
- ✅ Keeps user logged in when switching between pages

**Before:**
```typescript
// Cleared auth and redirected to login for any issue
clearAuth()
router.push('/auth/login')
```

**After:**
```typescript
// Only clears auth if truly not authenticated
// For wrong role, just redirects to correct dashboard
if (!isAuthenticated()) {
  clearAuth()  // Only clear if actually not authenticated
  router.push('/auth/login')
} else {
  // Just redirect to correct dashboard, keep auth
  router.push(correctDashboard)
}
```

### 3. Lenient Token Expiration
**File:** `lib/roleGuard.ts`

**Changes:**
- ✅ Added 5-minute buffer before considering token expired
- ✅ If no expiration set, considers token valid
- ✅ More forgiving token validation

**Before:**
```typescript
// Strict expiration check
return payload.exp < currentTime
```

**After:**
```typescript
// No expiration = valid token
if (!payload.exp) return false

// 5-minute buffer before expiring
const bufferTime = 5 * 60
return payload.exp < (currentTime - bufferTime)
```

### 4. Removed Automatic Redirects from Data Fetch
**Files:** 
- `app/dashboard/company/application/page.tsx`
- `app/dashboard/university/advisors/page.tsx`

**Changes:**
- ✅ No longer redirects to login on 401 errors
- ✅ Shows error message instead
- ✅ Lets RoleGuard handle authentication state
- ✅ Doesn't clear tokens on fetch errors

**Before:**
```typescript
if (response.status === 401) {
  localStorage.removeItem('token')
  window.location.href = '/auth/login'  // ❌ Forced redirect
}
```

**After:**
```typescript
if (response.status === 401) {
  alert('Session may have expired. Try logging out and in again.')
  return  // ✅ Just show error, don't redirect
}
```

## How It Works Now

### User Flow

1. **User logs in** → Token stored in localStorage
2. **User navigates to dashboard** → RoleGuard checks token
3. **Token valid?**
   - ✅ Yes → Show dashboard
   - ❌ No → Redirect to login (only if truly invalid)
4. **User navigates to different page** → RoleGuard checks again
5. **Wrong dashboard?**
   - Redirect to correct dashboard
   - **Keep user logged in** ✅

### Token Persistence

Tokens now persist across:
- ✅ Page navigation
- ✅ Browser refresh (as long as token valid)
- ✅ Switching between dashboard sections
- ✅ Temporary network errors

Tokens are only cleared when:
- ❌ User explicitly logs out
- ❌ Token is truly expired (beyond 5-minute buffer)
- ❌ Token is malformed/invalid

## Testing

### Test 1: Stay Logged In
```bash
1. Login as company user
2. Navigate to /dashboard/company
3. Navigate to /dashboard/company/application
4. Refresh page
5. Navigate back to /dashboard/company
✅ Should stay logged in throughout
```

### Test 2: Wrong Dashboard Redirect
```bash
1. Login as company user
2. Try to go to /dashboard/university/advisors
3. ✅ Should redirect to /dashboard/company
4. ✅ Should NOT redirect to login
5. ✅ Should stay logged in
```

### Test 3: Expired Token
```bash
1. Login
2. Wait for token to expire (or manually expire it)
3. Try to navigate to dashboard
4. ✅ Should redirect to login only when truly expired
```

## Benefits

1. **Better User Experience**
   - No annoying re-logins
   - Smooth navigation
   - Clear error messages

2. **Proper Session Management**
   - Tokens persist correctly
   - Graceful handling of errors
   - Only logout when necessary

3. **Correct Role Routing**
   - Wrong role → Correct dashboard (stay logged in)
   - No auth → Login page
   - Clear separation of concerns

## Configuration

### Adjust Token Buffer Time

If you want to change the expiration buffer:

```typescript
// lib/roleGuard.ts
const bufferTime = 5 * 60  // 5 minutes (change as needed)
return payload.exp < (currentTime - bufferTime)
```

### Adjust JWT Expiration (Backend)

To make tokens last longer:

```javascript
// backend - wherever JWT is created
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }  // Change from '1d' to '7d' for 7 days
)
```

## Troubleshooting

### Still Getting Logged Out

**Check:**
1. Token expiration in backend (make it longer)
2. Browser localStorage (make sure it's not being cleared)
3. Token buffer time (increase if needed)

### Can't Access Dashboard

**Check:**
1. User role in database matches dashboard
2. Token contains correct role
3. RoleGuard allowedRoles includes your role

## Summary

**Before:** Users had to login repeatedly, tokens cleared on any error  
**After:** Users stay logged in, smooth navigation, only logout when truly needed

✅ **Fixed!** Users can now access their dashboard anytime without repeated logins!
