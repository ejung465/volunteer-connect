@echo off
echo ========================================
echo Starting Volunteer Connect Application
echo ========================================
echo.

echo Starting backend server on port 3001...
start "Backend Server - Port 3001" cmd /k "cd /d %~dp0server && npm start"

timeout /t 2 /nobreak >nul

echo Starting frontend server on port 5173...
start "Frontend Server - Port 5173" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo ✓ Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo The servers will open in separate windows.
echo Close those windows to stop the servers.
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.
pause

