@echo off
echo ====================================
echo   InternHub - Push to GitHub
echo ====================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Step 1: Checking git status...
git status
echo.

echo ====================================
pause

echo.
echo Step 2: Adding all changes...
git add .
echo.
echo ✓ Changes added
echo.

echo ====================================
pause

echo.
echo Step 3: Committing changes...
echo.
set /p commit_msg="Enter commit message (or press Enter for default): "

if "%commit_msg%"=="" (
    git commit -m "feat: Add RBAC, bug fixes, and mentor assignment system - Implemented Role-Based Access Control - Fixed authentication bugs - Added mentor-student assignment (1:1 and 1:Many) - Enhanced error handling - Added comprehensive documentation"
) else (
    git commit -m "%commit_msg%"
)
echo.
echo ✓ Changes committed
echo.

echo ====================================
pause

echo.
echo Step 4: Pushing to GitHub...
echo.
echo Checking remote...
git remote -v
echo.

set /p branch="Enter branch name (default: main): "
if "%branch%"=="" set branch=main

echo.
echo Pushing to origin/%branch%...
git push origin %branch%
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo   ✓ Successfully pushed to GitHub!
    echo ====================================
    echo.
    echo Your changes are now on GitHub.
    echo Check: https://github.com/YOUR_USERNAME/internhub
) else (
    echo.
    echo ====================================
    echo   ✗ Push failed!
    echo ====================================
    echo.
    echo Common solutions:
    echo 1. Make sure you're connected to internet
    echo 2. Check if you have the correct permissions
    echo 3. Try: git push origin %branch% --force
    echo 4. Check PUSH_TO_GITHUB.md for troubleshooting
)

echo.
pause
