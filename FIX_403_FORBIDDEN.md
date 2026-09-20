# Fix 403 Forbidden Error - Advisors Page

## ✅ Good News!
The error handling is working perfectly! The error message **"403 Forbidden - insufficient permissions"** means the bug fix worked, and now we can see the actual problem: **you're logged in with the wrong role**.

## 🔍 The Problem

The `/api/advisors` endpoint requires users to have the **`university` role**, but you're currently logged in with a different role (probably `company`, `student`, or something else).

From your console output:
```
Response status: 403
Forbidden - insufficient permissions
```

This means:
- ✅ Your token is valid (not expired)
- ✅ You're authenticated
- ❌ But your role doesn't have permission to access advisors

---

## 🛠️ Solution Options

### Option 1: Quick Fix - Use the Script (Recommended)

Run this interactive script to check and update your user role:

```bash
cd backend
node checkAndFixUserRole.js
```

The script will:
1. Show all users in the database
2. Let you select your user
3. Show your current role
4. Let you change it to `university`
5. Confirm the update

**After updating:**
1. Logout from the application
2. Login again with the same credentials
3. Your new role will be in the JWT token
4. Access the Advisors page - it should work! ✅

---

### Option 2: Manual Database Update

If you prefer SQL, connect to your PostgreSQL database and run:

```sql
-- 1. Find your user
SELECT id, email, role, organization_name 
FROM users 
WHERE email = 'your-email@example.com';

-- 2. Update role to university
UPDATE users 
SET role = 'university', 
    updated_at = NOW() 
WHERE email = 'your-email@example.com';

-- 3. Verify the update
SELECT id, email, role, organization_name 
FROM users 
WHERE email = 'your-email@example.com';
```

**After updating:**
1. Logout from the application
2. Login again
3. Your JWT token will contain the new role

---

### Option 3: Debug Your Current Token

Open this debug page in your browser:
```
Open: frontend/internhub/app/dashboard/university/advisors/debug-token.html
```

Or manually check your token:

1. Open Browser DevTools (F12)
2. Go to **Console** tab
3. Run this code:

```javascript
// Get your token
const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
console.log('Token:', token);

// Decode it
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Decoded Token:', payload);
console.log('Your Role:', payload.role);
console.log('Your Email:', payload.email);

// Check if you have correct role
if (payload.role === 'university' || payload.role === 'admin') {
  console.log('✅ You have correct role for Advisors page');
} else {
  console.log('❌ You need "university" or "admin" role');
  console.log('Current role:', payload.role);
}
```

---

## 📊 Role Permissions Summary

| Role       | Can Access Advisors? | Other Permissions                           |
|------------|---------------------|---------------------------------------------|
| university | ✅ YES              | Students, Applications, Advisors Dashboard  |
| admin      | ✅ YES              | Everything (full access)                    |
| company    | ❌ NO               | Applications, Internship Posts, Mentors     |
| student    | ❌ NO               | View internships, Apply                     |

---

## 🎯 Step-by-Step Fix Guide

### Step 1: Check Current Role
```bash
cd backend
node checkAndFixUserRole.js
```

### Step 2: Update Role to University
Follow the script prompts to change your role

### Step 3: Logout & Login
1. Go to your application
2. Logout (clear localStorage or use logout button)
3. Login again with the same email/password

### Step 4: Verify New Token
Open Browser Console and run:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('My Role:', payload.role); // Should be 'university'
```

### Step 5: Access Advisors Page
Navigate to the Advisors Management page - it should work now! ✅

---

## 🔍 Verify the Fix

After updating role and logging in again, check the console:

**Expected Output:**
```
Fetching advisors from: http://localhost:5000/api/advisors
Response status: 200
Advisors fetched successfully: {...}
```

**If you still see 403:**
- Make sure you logged out completely
- Clear localStorage manually: `localStorage.clear()`
- Login again to get a fresh token with the new role

---

## 🚨 Still Having Issues?

### Check Backend Route Restrictions

Open `backend/routes/advisor.js` and verify:

```javascript
router.get("/", protect, restrictTo("university", "admin"), advisorController.getAllAdvisors);
```

This line means only users with role `university` or `admin` can access.

### Check Your Token in Database

```sql
-- Check what JWT_SECRET is being used
SELECT current_setting('app.jwt_secret', true);

-- Verify user role
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

### Clear Everything and Start Fresh

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then close tab and login again
```

---

## ✅ Success Checklist

- [ ] Ran `checkAndFixUserRole.js` script
- [ ] Updated role to `university`
- [ ] Logged out from application
- [ ] Logged in again
- [ ] Verified new token has correct role
- [ ] Accessed Advisors page successfully
- [ ] Console shows "Response status: 200"
- [ ] Advisors list loads without errors

---

## 🎉 Conclusion

The **403 Forbidden** error is not a bug - it's proper security working as intended! You just need to:

1. Update your user role to `university` in the database
2. Logout and login again to get a fresh token
3. Access the Advisors page with the correct permissions

**The bug fix worked perfectly** - we can now see the real issue instead of getting generic errors! 🎯
