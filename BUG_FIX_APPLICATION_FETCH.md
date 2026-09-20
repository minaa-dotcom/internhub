# Bug Fix: Failed to Fetch Applications - Company Dashboard

## Problem Description
The company application page was showing the error:
```
Failed to fetch applications
app/dashboard/company/application/page.tsx (105:31) @ fetchApplications
```

## Root Cause Analysis

The error occurred due to multiple potential issues:

1. **Poor Error Handling**: The frontend was throwing generic errors without logging the actual HTTP status or error message from the backend
2. **Authentication Issues**: Token validation failures weren't being handled properly
3. **Authorization Issues**: 403 Forbidden errors weren't being caught and displayed to users
4. **Status Filter Bug**: The status filter was being sent with uppercase values but the backend expects lowercase

## Changes Made

### Frontend Changes (`frontend/internhub/app/dashboard/company/application/page.tsx`)

#### 1. Enhanced `fetchApplications` Function
- Added token existence check before making API calls
- Added proper error logging with HTTP status codes
- Added specific handling for 401 (Unauthorized) and 403 (Forbidden) errors
- Fixed status filter to send lowercase values to match backend expectations
- Added user-friendly error messages with alerts
- Added automatic redirect to login on authentication failures

#### 2. Enhanced `fetchStats` Function
- Added token existence check
- Added proper error handling without disrupting the main application flow
- Prevents redirect conflicts with fetchApplications

#### 3. Enhanced `updateApplicationStatus` Function
- Added token validation before attempting updates
- Added detailed error logging
- Added specific handling for 401 and 403 errors
- Added user feedback via alerts
- Changed to await the refresh functions to ensure proper sequencing

## Testing Instructions

### 1. Test with Valid Company Account

```bash
# Ensure backend is running
cd backend
npm run dev

# Ensure frontend is running
cd frontend/internhub
npm run dev
```

**Steps:**
1. Navigate to `http://localhost:3000/auth/login`
2. Log in with a company account (role: 'company')
3. Navigate to the applications page
4. Open browser DevTools Console (F12)
5. Check for these console logs:
   - "Fetching applications from: http://localhost:5000/api/applications/company?..."
   - "Response status: 200"
   - "Applications fetched successfully: {...}"

**Expected Result:**
- Applications should load successfully
- Stats cards should show correct counts
- No errors in console

### 2. Test with Invalid/Expired Token

**Steps:**
1. Open browser DevTools → Application → Local Storage
2. Find the 'token' key and modify it to an invalid value
3. Refresh the page

**Expected Result:**
- Console should log: "Response status: 401"
- Console should log: "Unauthorized - redirecting to login"
- User should be redirected to login page
- Token should be cleared from localStorage

### 3. Test with Wrong Role (e.g., University Account)

**Steps:**
1. Log out if logged in
2. Log in with a university account (role: 'university')
3. Try to navigate to `/dashboard/company/application`

**Expected Result:**
- Console should log: "Response status: 403"
- Console should log: "Forbidden - insufficient permissions"
- Alert should display: "You do not have permission to view applications..."

### 4. Test Application Status Updates

**Steps:**
1. Log in as a company user
2. Click "View Details" on any application
3. Change status (e.g., from PENDING to UNDER_REVIEW)
4. Check console for logs

**Expected Result:**
- Console should log: "Updating application: [id] to status: under_review"
- Console should log: "Status updated successfully"
- Applications list should refresh automatically
- Stats should update to reflect the change

### 5. Test No Applications Scenario

**Steps:**
1. Log in with a company account that has no applications
2. Navigate to applications page

**Expected Result:**
- Page should load without errors
- Should show "No applications found" message
- Stats should show zeros

## Backend Verification

Ensure the following backend configurations are correct:

### 1. Check Database Tables

```sql
-- Verify companyapplications table exists
SELECT * FROM companyapplications LIMIT 1;

-- Check if there are any applications for your company
SELECT COUNT(*) FROM companyapplications WHERE company_id = 'your-company-uuid';
```

### 2. Check Backend Routes

Verify in `backend/routes/application.js`:
- `/api/applications/company/stats` route is defined BEFORE `/api/applications/company`
- Both routes have `restrictTo('company')` middleware

### 3. Check CORS Configuration

In `backend/app.js`, ensure CORS allows your frontend origin:
```javascript
cors({
  origin: ["http://localhost:3000", ...]
})
```

## Common Issues and Solutions

### Issue 1: "No authentication token found"
**Solution:** User needs to log in again. Token may have been cleared or never set.

### Issue 2: "403 Forbidden"
**Solution:** 
- Verify the user has role 'company' in the database
- Check JWT token payload: `jwt.verify(token, process.env.JWT_SECRET)`

### Issue 3: Empty Applications List
**Solution:**
- Check if applications exist in `companyapplications` table for this company_id
- Verify company_id in the token matches records in the database

### Issue 4: Stats Not Loading
**Solution:**
- Check browser console for specific error
- Verify `/api/applications/company/stats` endpoint is accessible
- Ensure backend is running and database connection is active

## API Endpoints Reference

### Get Company Applications
```
GET /api/applications/company
Headers: Authorization: Bearer <token>
Query Params: page, limit, status (lowercase)
Response: { applications: [], pagination: {} }
```

### Get Company Stats
```
GET /api/applications/company/stats
Headers: Authorization: Bearer <token>
Response: { total, pending, under_review, shortlisted, accepted, rejected }
```

### Update Application Status
```
PUT /api/applications/:id/review
Headers: Authorization: Bearer <token>
Body: { status: string (lowercase), feedback: string }
Response: { message, application }
```

## Additional Debugging

If issues persist, add these debug endpoints to your backend temporarily:

```javascript
// Add to backend/app.js
app.get('/api/debug/me', protect, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/debug/applications', protect, async (req, res) => {
  const result = await db.query('SELECT COUNT(*) FROM companyapplications WHERE company_id = $1', [req.user.id]);
  res.json({ count: result.rows[0].count, userId: req.user.id });
});
```

Then call these endpoints to verify:
1. Token is valid and contains correct user data
2. Applications exist for the company

## Status Filter Fix

The status filter now correctly converts to lowercase before sending to the backend:

```typescript
...(statusFilter !== 'ALL' && { status: statusFilter.toLowerCase() })
```

This ensures compatibility with the backend's lowercase status values:
- 'pending'
- 'under_review'
- 'shortlisted'
- 'accepted'
- 'rejected'

## Conclusion

The bug has been fixed by:
1. ✅ Adding comprehensive error handling and logging
2. ✅ Implementing proper authentication checks
3. ✅ Adding user-friendly error messages
4. ✅ Fixing status filter case sensitivity
5. ✅ Implementing automatic login redirect on auth failures

The application should now provide clear feedback about what's going wrong and guide users appropriately.


---

## Additional Fix: Failed to Fetch Advisors - University Dashboard

### Problem Description
The university advisors page was showing the error:
```
Failed to fetch advisors
app/dashboard/university/advisors/page.tsx (119:31) @ fetchAdvisors
```

### Root Cause
Same issue as the company applications bug:
1. Poor error handling without specific HTTP status logging
2. Authentication issues not being handled properly
3. Missing user-friendly error messages

### Changes Made

#### Frontend Changes (`frontend/internhub/app/dashboard/university/advisors/page.tsx`)

##### 1. Enhanced `fetchAdvisors` Function
- Added token existence check before making API calls
- Added proper error logging with HTTP status codes
- Added specific handling for 401 (Unauthorized) and 403 (Forbidden) errors
- Added user-friendly error messages
- Added automatic redirect to login on authentication failures
- Added router navigation for better UX

##### 2. Enhanced `fetchAcceptedStudents` Function
- Added token validation
- Added detailed console logging for debugging
- Better error handling for multiple API calls
- Proper handling of fallback scenarios

### Testing Instructions

#### Run the Test Script

```bash
cd backend
node testAdvisorsEndpoint.js
```

This will verify:
- ✅ Advisors table exists
- ✅ University users are present
- ✅ Advisors are created in the database
- ✅ Student assignments are working
- ✅ Accepted applications are available
- ✅ API queries work correctly

#### Manual Testing Steps

1. **Start servers:**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend/internhub
   npm run dev
   ```

2. **Test with Valid University Account:**
   - Navigate to `http://localhost:3000/auth/login`
   - Log in with a university account (role: 'university')
   - Go to Advisors Management page
   - Open browser DevTools Console (F12)
   - Check for console logs showing the fetch process

3. **Expected Console Output:**
   ```
   Fetching advisors from: http://localhost:5000/api/advisors
   Response status: 200
   Advisors fetched successfully: {...}
   Fetching accepted students...
   Students fetched: {...}
   ```

4. **Test Creating an Advisor:**
   - Click "Create Advisor" button
   - Fill in the form
   - Submit
   - Check console for detailed logs

5. **Test Assigning Students:**
   - Click "Assign" on an advisor
   - Select one or more unassigned students
   - Click "Assign" button
   - Verify assignment is successful

### Common Issues and Solutions

#### Issue 1: "No authentication token found"
**Solution:** User needs to log in. Token may have expired or never been set.

#### Issue 2: "403 Forbidden"
**Solution:** 
- Verify the user has role 'university' in the database
- Check JWT token payload contains correct role

#### Issue 3: Empty Advisors List
**Solution:**
- Check if advisors exist in the `advisors` table
- Verify university_id in advisors matches the logged-in user's ID
- Use the test script to check database state

#### Issue 4: No Students Available for Assignment
**Solution:**
- Ensure there are accepted applications in `universityapplications` table
- Check application status is 'accepted'
- Verify applications haven't already been assigned

### API Endpoints Reference

#### Get All Advisors
```
GET /api/advisors
Headers: Authorization: Bearer <token>
Restrictions: university, admin roles only
Response: { success: true, advisors: [] }
```

#### Create Advisor
```
POST /api/advisors
Headers: Authorization: Bearer <token>
Body: { first_name, last_name, email, department, phone, university_id }
Response: { success: true, message, advisor }
```

#### Assign Student to Advisor
```
POST /api/advisors/assign
Headers: Authorization: Bearer <token>
Body: { advisor_id, application_id, student_name, student_email, department, company_name }
Response: { success: true, message, assignment }
```

#### Get Assigned Application IDs
```
GET /api/advisors/assigned/application-ids
Headers: Authorization: Bearer <token>
Response: { success: true, assignedApplicationIds: [] }
```

### Database Schema

#### advisors table
```sql
CREATE TABLE advisors (
  id UUID PRIMARY KEY,
  university_id UUID REFERENCES users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(150),
  phone VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### student_assignments table
```sql
CREATE TABLE student_assignments (
  id UUID PRIMARY KEY,
  advisor_id UUID REFERENCES advisors(id),
  application_id UUID NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  department VARCHAR(150),
  company_name VARCHAR(255),
  assigned_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active'
);
```

### Additional Debugging

Add this debug endpoint to `backend/app.js` temporarily:

```javascript
// Debug advisors
app.get('/api/debug/advisors', protect, async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) as count FROM advisors WHERE university_id = $1', [req.user.id]);
    const advisors = await db.query('SELECT * FROM advisors WHERE university_id = $1 LIMIT 5', [req.user.id]);
    res.json({ 
      count: result.rows[0].count, 
      userId: req.user.id,
      role: req.user.role,
      advisors: advisors.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Summary

Both bugs (company applications and university advisors) have been fixed with:
1. ✅ Comprehensive error handling and logging
2. ✅ Proper authentication checks
3. ✅ User-friendly error messages and alerts
4. ✅ Automatic login redirect on auth failures
5. ✅ Detailed console logging for debugging

The applications should now provide clear feedback about what's happening and guide users appropriately when errors occur.
