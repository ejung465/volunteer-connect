# Diagnose Login Issues

## Step 1: Verify Database Has Users

Run this command:
```cmd
cd server
node verify-users.js
```

This will show:
- ✅ If demo accounts exist
- ✅ If passwords are set correctly
- ❌ What's missing

## Step 2: Check Backend Console

When you try to login, **watch the backend console** (the terminal where you ran `npm start`).

You should see messages like:
```
[LOGIN] Attempting login for: admin@example.com
[LOGIN] User found: Yes
[LOGIN] User role: admin, User ID: 1
[LOGIN] Checking password...
[LOGIN] Password valid: true
```

**If you see errors or "No", that tells us what's wrong!**

## Step 3: Common Issues

### Issue: "User found: No"

**Problem:** Database doesn't have the demo accounts.

**Solution:**
```cmd
cd server
del database.sqlite
npm start
```

Wait for: `✅ Initial data seeded successfully`

### Issue: "Password valid: false"

**Problem:** Password hash doesn't match.

**Solution:** The database might be corrupted. Reset it:
```cmd
cd server
del database.sqlite
npm start
```

### Issue: "No password hash"

**Problem:** Users exist but don't have passwords.

**Solution:** Reset database (same as above).

## Step 4: Test Login with Exact Credentials

Make sure you're using **exact** email addresses (case-sensitive):

✅ **Correct:**
- `admin@example.com` / `admin123`
- `volunteer@example.com` / `volunteer123`
- `student@example.com` / `student123`

❌ **Wrong:**
- `Admin@example.com` (capital A)
- `admin@Example.com` (capital E)
- ` admin@example.com ` (spaces)

## Step 5: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to login
4. Look for any red error messages

## Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Click on the `/api/auth/login` request
5. Check:
   - **Status:** Should be 200 (success) or 401 (unauthorized)
   - **Response:** What error message is returned?

## Quick Fix Script

I created `server/fix-login.bat` - double-click it to:
1. Verify users exist
2. Reset database if needed
3. Give you next steps

## Still Not Working?

Share with me:
1. **Output of:** `node verify-users.js`
2. **Backend console messages** when you try to login (the [LOGIN] messages)
3. **Browser console errors** (if any)
4. **Network tab response** from the login request

This will help me identify the exact problem!

