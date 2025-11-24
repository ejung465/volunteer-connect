@echo off
echo ========================================
echo Fix Login Issues
echo ========================================
echo.

echo Step 1: Verifying database...
node verify-users.js
if errorlevel 1 (
    echo.
    echo ❌ Database verification failed!
    echo.
    echo Step 2: Resetting database...
    if exist database.sqlite (
        del database.sqlite
        echo ✓ Database deleted
    )
    echo.
    echo ✅ Now restart your server with: npm start
    echo    The database will be recreated with demo accounts.
) else (
    echo.
    echo ✅ Database looks good!
    echo.
    echo If login still doesn't work:
    echo 1. Check the backend console when you try to login
    echo 2. Look for [LOGIN] messages
    echo 3. Make sure you're using exact email addresses (case-sensitive)
)

echo.
pause

