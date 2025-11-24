# Fix Login Issues - Step by Step

## Problem: Demo accounts not working

If you're getting "Invalid email or password" errors, follow these steps:

## Step 1: Stop the Backend Server
Press `Ctrl+C` in the terminal where the backend is running.

## Step 2: Reset the Database

**Option A: Using the batch file (Windows)**
```cmd
cd server
reset-db.bat
```

**Option B: Manual reset**
```cmd
cd server
del database.sqlite
```

## Step 3: Restart the Backend Server
```cmd
cd server
npm start
```

You should see:
```
📝 Creating new database...
📋 Creating database tables...
✅ Database tables created successfully
📦 Seeding initial data...
✅ Initial data seeded successfully
```

## Step 4: Check the Console Logs

When you try to login, check the backend console. You should see:
```
[LOGIN] Attempting login for: admin@example.com
[LOGIN] User found: Yes
[LOGIN] User role: admin, User ID: 1
[LOGIN] Password valid: true
```

If you see errors, they will be logged here.

## Step 5: Test the Database

Run the test script to verify the database has users:
```cmd
cd server
node test-db.js
```

This will show all users in the database.

## Step 6: Try Logging In Again

Use these credentials:
- **Admin:** `admin@example.com` / `admin123`
- **Volunteer:** `volunteer@example.com` / `volunteer123`
- **Student:** `student@example.com` / `student123`

## Common Issues

### Issue: "Database already contains data, skipping seed"
**Solution:** Delete `server/database.sqlite` and restart the server.

### Issue: "SQL Error" in console
**Solution:** Check that all dependencies are installed:
```cmd
cd server
npm install
```

### Issue: No users found in test-db.js
**Solution:** The database might be corrupted. Delete it and restart:
```cmd
cd server
del database.sqlite
npm start
```

### Issue: Still getting "Invalid credentials"
**Solution:** 
1. Check the backend console for `[LOGIN]` messages
2. Run `node test-db.js` to verify users exist
3. Make sure you're using the exact email addresses (case-sensitive)
4. Check that the backend is running on port 3001

## Verify Backend is Running

Test the health endpoint:
```cmd
curl http://localhost:3001/api/health
```

Or open in browser: `http://localhost:3001/api/health`

Should return: `{"status":"ok","message":"Server is running"}`

## Still Not Working?

1. **Check browser console** (F12) for any frontend errors
2. **Check backend console** for SQL errors or login attempts
3. **Verify the database file exists**: `server/database.sqlite`
4. **Check network tab** in browser DevTools to see the API request/response

## Debug Information

The login route now logs:
- Email being used
- Whether user was found
- User role and ID
- Whether password is valid
- All users in database (if login fails)

Check your backend console for these messages!

