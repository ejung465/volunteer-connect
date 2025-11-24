# Localhost Setup Guide for Windows CMD

## Step-by-Step Instructions

### Step 1: Open Command Prompt
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Or search "Command Prompt" in Start Menu

### Step 2: Navigate to Your Project
```cmd
cd "C:\Users\ethan\Documents\NEWPROJ A-1"
```

### Step 3: Install Frontend Dependencies
```cmd
npm install
```
Wait for installation to complete.

### Step 4: Install Backend Dependencies
```cmd
cd server
npm install
cd ..
```

### Step 5: Create Backend Environment File
```cmd
cd server
echo PORT=3001 > .env
echo NODE_ENV=development >> .env
echo JWT_SECRET=dev-secret-key-12345 >> .env
echo CORS_ORIGIN=http://localhost:5173 >> .env
cd ..
```

Or manually create `server\.env` file with:
```
PORT=3001
NODE_ENV=development
JWT_SECRET=dev-secret-key-12345
CORS_ORIGIN=http://localhost:5173
```

### Step 6: Start Backend Server (First Terminal)
```cmd
cd server
npm start
```
Keep this terminal open - you should see:
```
╔════════════════════════════════════════════════════════╗
║   🚀 Volunteer Connect Server                         ║
║   Server running on: http://localhost:3001            ║
╚════════════════════════════════════════════════════════╝
```

### Step 7: Start Frontend Server (New Terminal)
Open a **NEW** Command Prompt window:
```cmd
cd "C:\Users\ethan\Documents\NEWPROJ A-1"
npm run dev
```
You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 8: Open in Browser
Open your browser and go to:
```
http://localhost:5173
```

## Quick Setup Script (All-in-One)

Create a file `setup-localhost.bat` in your project root:

```batch
@echo off
echo Installing frontend dependencies...
call npm install

echo Installing backend dependencies...
cd server
call npm install
cd ..

echo Creating backend .env file...
cd server
if not exist .env (
    echo PORT=3001 > .env
    echo NODE_ENV=development >> .env
    echo JWT_SECRET=dev-secret-key-12345 >> .env
    echo CORS_ORIGIN=http://localhost:5173 >> .env
    echo Backend .env file created!
) else (
    echo Backend .env file already exists.
)
cd ..

echo.
echo ========================================
echo Setup complete!
echo.
echo To start the application:
echo   1. Open a terminal and run: cd server && npm start
echo   2. Open another terminal and run: npm run dev
echo   3. Open browser to: http://localhost:5173
echo ========================================
pause
```

## Running the Application

### Method 1: Two Separate Terminals

**Terminal 1 (Backend):**
```cmd
cd "C:\Users\ethan\Documents\NEWPROJ A-1\server"
npm start
```

**Terminal 2 (Frontend):**
```cmd
cd "C:\Users\ethan\Documents\NEWPROJ A-1"
npm run dev
```

### Method 2: Using Windows Batch File

Create `start-localhost.bat` in project root:

```batch
@echo off
echo Starting Volunteer Connect Application...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd /d %~dp0server && npm start"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit (servers will keep running)...
pause >nul
```

Then just double-click `start-localhost.bat` to start both servers!

## Testing the Setup

### Test Backend
Open a new CMD window and run:
```cmd
curl http://localhost:3001/api/health
```

Or open in browser: `http://localhost:3001/api/health`
Should return: `{"status":"ok","message":"Server is running"}`

### Test Frontend
1. Open browser: `http://localhost:5173`
2. Try logging in with:
   - Email: `admin@example.com`
   - Password: `admin123`

## Troubleshooting

### Port Already in Use
If port 3001 is busy:
```cmd
cd server
# Edit .env file and change PORT=3001 to PORT=3002
# Then update CORS_ORIGIN if needed
```

### Node Not Found
```cmd
# Check Node.js is installed
node --version
npm --version

# If not installed, download from nodejs.org
```

### npm install Fails
```cmd
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Backend Won't Start
```cmd
cd server
# Check if .env file exists
dir .env

# If missing, create it manually
notepad .env
# Then paste the environment variables
```

## Quick Commands Reference

```cmd
# Navigate to project
cd "C:\Users\ethan\Documents\NEWPROJ A-1"

# Install dependencies
npm install
cd server && npm install && cd ..

# Start backend (Terminal 1)
cd server
npm start

# Start frontend (Terminal 2)
npm run dev

# Check if servers are running
curl http://localhost:3001/api/health
curl http://localhost:5173
```

## Demo Accounts

Once running, you can login with:

- **Admin:** `admin@example.com` / `admin123`
- **Volunteer:** `volunteer@example.com` / `volunteer123`
- **Student:** `student@example.com` / `student123`

