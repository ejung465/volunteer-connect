@echo off
echo ========================================
echo Volunteer Connect - Localhost Setup
echo ========================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo.

echo [2/4] Installing backend dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
cd ..
echo.

echo [3/4] Creating backend .env file...
cd server
if not exist .env (
    echo PORT=3001 > .env
    echo NODE_ENV=development >> .env
    echo JWT_SECRET=dev-secret-key-12345 >> .env
    echo CORS_ORIGIN=http://localhost:5173 >> .env
    echo ✓ Backend .env file created!
) else (
    echo ✓ Backend .env file already exists.
)
cd ..
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Start Backend (Terminal 1):
echo    cd server
echo    npm start
echo.
echo 2. Start Frontend (Terminal 2):
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:5173
echo.
echo ========================================
pause

