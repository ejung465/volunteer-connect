@echo off
echo ========================================
echo Server Status Check
echo ========================================
echo.

echo Checking if backend server is running on port 3001...
netstat -ano | findstr :3001
if errorlevel 1 (
    echo ❌ Backend server is NOT running on port 3001
    echo.
    echo To start it, run:
    echo   cd server
    echo   npm start
) else (
    echo ✅ Backend server appears to be running
)

echo.
echo Checking if frontend server is running on port 5173...
netstat -ano | findstr :5173
if errorlevel 1 (
    echo ❌ Frontend server is NOT running on port 5173
    echo.
    echo To start it, run:
    echo   npm run dev
) else (
    echo ✅ Frontend server appears to be running
)

echo.
echo ========================================
echo Testing Backend Connection
echo ========================================
echo.

curl -s http://localhost:3001/api/health
if errorlevel 1 (
    echo.
    echo ❌ Cannot connect to backend at http://localhost:3001
    echo    Make sure the server is running!
) else (
    echo.
    echo ✅ Backend is responding!
)

echo.
echo ========================================
pause

