# Fix "Localhost Refused to Connect" Error

## Quick Diagnosis

### Step 1: Check if Backend Server is Running

Open a **new** Command Prompt and check:
```cmd
netstat -ano | findstr :3001
```

If you see output, the server is running. If not, it's not running.

### Step 2: Check for Server Errors

Look at the terminal where you ran `npm start`. Do you see:
- ✅ `Server running on: http://localhost:3001`
- ❌ Any error messages?

## Common Issues & Solutions

### Issue 1: Server Not Started

**Solution:** Start the backend server:
```cmd
cd server
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║   🚀 Volunteer Connect Server                         ║
║   Server running on: http://localhost:3001            ║
╚════════════════════════════════════════════════════════╝
```

### Issue 2: Port 3001 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution A:** Find and kill the process using port 3001:
```cmd
netstat -ano | findstr :3001
```
Note the PID (last number), then:
```cmd
taskkill /PID <PID_NUMBER> /F
```

**Solution B:** Use a different port. Edit `server/.env`:
```
PORT=3002
```
Then update frontend `.env.local`:
```
VITE_API_URL=http://localhost:3002
```

### Issue 3: Database Initialization Error

**Error:** SQL errors or database errors in console

**Solution:**
```cmd
cd server
del database.sqlite
npm start
```

### Issue 4: Missing Dependencies

**Error:** `Cannot find module` or `Module not found`

**Solution:**
```cmd
cd server
npm install
npm start
```

### Issue 5: Node.js Not Found

**Error:** `'node' is not recognized`

**Solution:** Install Node.js from https://nodejs.org/

## Step-by-Step Restart

1. **Stop everything:**
   - Close all terminal windows
   - Press `Ctrl+C` in any running server terminals

2. **Kill any processes on port 3001:**
   ```cmd
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

3. **Start Backend:**
   ```cmd
   cd "C:\Users\ethan\Documents\NEWPROJ A-1\server"
   npm start
   ```
   Wait for: `Server running on: http://localhost:3001`

4. **Start Frontend (new terminal):**
   ```cmd
   cd "C:\Users\ethan\Documents\NEWPROJ A-1"
   npm run dev
   ```

5. **Test Backend:**
   - Open browser: `http://localhost:3001/api/health`
   - Should see: `{"status":"ok","message":"Server is running"}`

6. **Test Frontend:**
   - Open browser: `http://localhost:5173`

## Which URL Are You Trying to Access?

- **Backend API:** `http://localhost:3001`
- **Frontend App:** `http://localhost:5173`
- **Health Check:** `http://localhost:3001/api/health`

Make sure you're accessing the correct URL!

## Quick Test Commands

**Test if backend is running:**
```cmd
curl http://localhost:3001/api/health
```

**Check what's using port 3001:**
```cmd
netstat -ano | findstr :3001
```

**Check what's using port 5173:**
```cmd
netstat -ano | findstr :5173
```

## Still Not Working?

1. **Check Windows Firewall** - It might be blocking Node.js
2. **Try a different browser** - Clear cache and try again
3. **Check antivirus** - It might be blocking the connection
4. **Restart your computer** - Sometimes helps clear port issues

## Need More Help?

Share:
1. What URL you're trying to access
2. Any error messages from the backend console
3. Output of `netstat -ano | findstr :3001`

