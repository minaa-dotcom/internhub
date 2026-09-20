# 🔐 How to Access Admin Dashboard

## 🎯 Overview

There are **4 methods** to access the admin dashboard. Choose the one that fits your situation best.

---

## 📋 Quick Comparison

| Method | Difficulty | Use Case | Time |
|--------|-----------|----------|------|
| **Method 1: Create Script** | ⭐ Easy | No admin exists | 2 min |
| **Method 2: Direct SQL** | ⭐⭐ Medium | Database access | 1 min |
| **Method 3: Update Script** | ⭐ Easy | Convert existing user | 2 min |
| **Method 4: Signup & Update** | ⭐⭐⭐ Manual | No direct DB access | 5 min |

---

## Method 1: Create Admin User Script (Recommended) ⭐

**Best for:** First time setup, no admin exists yet

### **Step 1: Run the Script**

```bash
cd c:\Users\hp\internhub\backend
node createAdminUser.js
```

### **Step 2: You'll See:**

```
✅ Admin user created successfully!

📋 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    admin@internhub.com
🔑 Password: Admin@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **Step 3: Login**

1. Go to: http://localhost:3000/auth/login
2. Email: `admin@internhub.com`
3. Password: `Admin@123456`
4. Click "Login"
5. ✅ You'll be redirected to `/dashboard/admin`

### **Step 4: Change Password (Important!)**

After first login, change the default password immediately!

---

## Method 2: Direct SQL Query

**Best for:** Quick setup, comfortable with SQL

### **Step 1: Connect to PostgreSQL**

```bash
# Open PostgreSQL command line
psql -U postgres -d internhub
```

### **Step 2: Run SQL Command**

```sql
-- Create admin user with hashed password
INSERT INTO users (id, email, password, first_name, last_name, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@internhub.com',
  '$2a$10$YourHashedPasswordHere',  -- You need to hash password first!
  'Admin',
  'User',
  'admin',
  NOW()
);
```

**Note:** Password must be bcrypt hashed. Use Method 1 (script) to handle this automatically.

---

## Method 3: Convert Existing User to Admin

**Best for:** You already have a user account

### **Step 1: Run the Script**

```bash
cd c:\Users\hp\internhub\backend

# Replace with your actual email
node makeUserAdmin.js user@example.com
```

### **Step 2: You'll See:**

```
✅ User role updated to ADMIN!

📋 Updated User:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    user@example.com
🎭 New Role: admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **Step 3: Re-login**

1. **Logout** from current session
2. **Login** again with same email
3. ✅ You'll now have admin access

---

## Method 4: Manual SQL Update

**Best for:** Direct database access

### **Via PostgreSQL:**

```sql
-- Update existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your.email@example.com';

-- Verify the change
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE email = 'your.email@example.com';
```

### **Via pgAdmin or Database GUI:**

1. Open your database tool
2. Navigate to `users` table
3. Find your user row
4. Change `role` column to `admin`
5. Save changes
6. Logout and login again

---

## 🌐 Accessing Admin Dashboard

### **Frontend URL:**
```
http://localhost:3000/dashboard/admin
```

### **Admin Routes:**
- Main Dashboard: `/dashboard/admin`
- User Management: `/dashboard/admin/users`
- Company Management: `/dashboard/admin/companies`
- University Management: `/dashboard/admin/universities`
- Student Management: `/dashboard/admin/students`
- Analytics: `/dashboard/admin/analytics`
- Messages: `/dashboard/admin/messages`
- Settings: `/dashboard/admin/settings`

---

## 🔐 Default Admin Credentials

**If you used Method 1 (Create Script):**

```
Email:    admin@internhub.com
Password: Admin@123456
```

**⚠️ SECURITY WARNING:**
- Change password immediately after first login!
- Use strong password (8+ chars, uppercase, lowercase, number, special char)
- Never share admin credentials
- Enable 2FA if available

---

## 🧪 Testing Admin Access

### **Test 1: Check User Role in Database**

```sql
SELECT id, email, role, created_at 
FROM users 
WHERE role = 'admin';
```

**Expected:** List of admin users

### **Test 2: Test Backend API**

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@internhub.com","password":"Admin@123456"}'

# Copy the token from response

# Test admin endpoint
curl http://localhost:5000/api/secure/management/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** Stats data (not 403 error)

### **Test 3: Frontend Login**

1. Go to http://localhost:3000/auth/login
2. Login with admin credentials
3. Check URL redirects to `/dashboard/admin`
4. Verify admin sidebar shows admin options

---

## 🐛 Troubleshooting

### **Problem 1: "User already exists"**

**Solution:**
Use Method 3 to update existing user to admin:
```bash
node makeUserAdmin.js admin@internhub.com
```

### **Problem 2: "403 Forbidden" on admin routes**

**Check:**
1. User role is actually 'admin' in database:
   ```sql
   SELECT email, role FROM users WHERE email = 'your@email.com';
   ```
2. Logout and login again (JWT token needs update)
3. Clear browser cache/cookies

**Fix if role is wrong:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### **Problem 3: Can't login with admin credentials**

**Check:**
1. User exists in database
2. Password is correct
3. Backend is running on port 5000
4. Frontend is running on port 3000

**Debug:**
```bash
# Check if user exists
cd backend
node -e "
const db = require('./config/dbConnection');
db.query('SELECT * FROM users WHERE email = \\'admin@internhub.com\\'')
  .then(r => console.log(r.rows))
  .then(() => process.exit(0))
"
```

### **Problem 4: Redirected away from admin dashboard**

**Cause:** RoleGuard checking your role

**Solution:**
1. Your JWT token has wrong role
2. Logout and login again to get new token with correct role

### **Problem 5: "Invalid password" error**

**Solution:**
Reset password:
```bash
node createAdminUser.js  # Creates with default password
# OR
node makeUserAdmin.js your@email.com  # Updates existing user
```

---

## 🔄 Password Reset for Admin

### **Method 1: Via Script** (Coming soon)

Create `resetAdminPassword.js`:
```javascript
// Run: node resetAdminPassword.js admin@internhub.com NewPassword123
```

### **Method 2: Via SQL**

```sql
-- You need to hash password with bcrypt first
-- Then update:
UPDATE users 
SET password = '$2a$10$YourNewHashedPassword' 
WHERE email = 'admin@internhub.com';
```

### **Method 3: Recreate Admin**

```sql
-- Delete old admin
DELETE FROM users WHERE email = 'admin@internhub.com';

-- Run create script again
-- node createAdminUser.js
```

---

## 📊 Admin User Management

### **List All Admins:**

```sql
SELECT id, email, first_name, last_name, created_at 
FROM users 
WHERE role = 'admin' 
ORDER BY created_at DESC;
```

### **Count Users by Role:**

```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### **Demote Admin to Regular User:**

```sql
UPDATE users 
SET role = 'company'  -- or 'university', 'student'
WHERE email = 'admin@internhub.com';
```

---

## 🎯 Step-by-Step First Time Setup

### **Complete Walkthrough:**

1. **Start Backend**
   ```bash
   cd c:\Users\hp\internhub\backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd c:\Users\hp\internhub\frontend\internhub
   npm run dev
   ```

3. **Create Admin User**
   ```bash
   cd c:\Users\hp\internhub\backend
   node createAdminUser.js
   ```

4. **Open Browser**
   ```
   http://localhost:3000/auth/login
   ```

5. **Login with Admin Credentials**
   ```
   Email: admin@internhub.com
   Password: Admin@123456
   ```

6. **Verify Admin Access**
   - You should see admin dashboard
   - Sidebar shows admin options
   - URL is `/dashboard/admin`

7. **Change Password** (Important!)
   - Go to Settings or Profile
   - Change default password

---

## 🔒 Security Best Practices

### **After Creating Admin:**

1. ✅ Change default password immediately
2. ✅ Use strong password (min 8 chars, mixed case, numbers, symbols)
3. ✅ Never commit admin credentials to Git
4. ✅ Don't share admin access
5. ✅ Use unique password (not reused elsewhere)
6. ✅ Enable 2FA if available
7. ✅ Monitor admin activity logs
8. ✅ Create separate admin accounts for each admin user
9. ✅ Disable/delete unused admin accounts
10. ✅ Regular security audits

### **Password Requirements:**

Good Password Examples:
- ✅ `Adm!n@Int3rnHub2024`
- ✅ `Secur3P@ssw0rd!`
- ✅ `MyStr0ng#P@ssw0rd`

Bad Password Examples:
- ❌ `admin123` (too simple)
- ❌ `password` (common word)
- ❌ `12345678` (sequential)
- ❌ `Admin@123456` (default - must change!)

---

## 📝 Quick Reference Commands

```bash
# Create new admin
node createAdminUser.js

# Make existing user admin
node makeUserAdmin.js user@example.com

# Check admin users (SQL)
SELECT * FROM users WHERE role = 'admin';

# Update user to admin (SQL)
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

# Login URL
http://localhost:3000/auth/login

# Admin Dashboard URL
http://localhost:3000/dashboard/admin
```

---

## 🎉 Success Indicators

You know admin access is working when:

- ✅ Login successful with admin email
- ✅ Redirected to `/dashboard/admin` (not company or university)
- ✅ Admin sidebar visible with all options
- ✅ Can see admin stats (total users, companies, etc.)
- ✅ Can access `/dashboard/admin/users`
- ✅ Can access `/dashboard/admin/analytics`
- ✅ No 403 errors in console
- ✅ Backend logs show `[ADMIN ACCESS]` messages

---

## 📞 Need Help?

**Check these in order:**

1. Backend running? → `npm run dev` in backend folder
2. Frontend running? → `npm run dev` in frontend folder
3. Database running? → Check PostgreSQL service
4. Admin user exists? → Run SQL query to check
5. Correct credentials? → Double-check email and password
6. Role is 'admin'? → Check database role column
7. Logged out and back in? → Clear session and re-login

---

**Choose Method 1 (createAdminUser.js) for easiest setup!** 🚀
