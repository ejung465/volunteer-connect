@echo off
echo ========================================
echo Resetting Database
echo ========================================
echo.

if exist database.sqlite (
    echo Deleting old database...
    del database.sqlite
    echo ✓ Database deleted
) else (
    echo No existing database found
)

echo.
echo Now restart your server with: npm start
echo The database will be recreated with demo accounts.
echo.
pause

