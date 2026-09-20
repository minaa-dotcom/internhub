@echo off
echo ====================================
echo   InternHub - GitHub Setup
echo ====================================
echo.

cd /d "%~dp0"

echo This script will help you push InternHub to GitHub
echo.
echo PREREQUISITES:
echo - You have created a repository on GitHub
echo - You have your GitHub username ready
echo - You have a Personal Access Token (not password)
echo.

pause

echo.
echo ====================================
echo   Step 1: Configure Git
echo ====================================
echo.

set /p git_name="Enter your name: "
set /p git_email="Enter your email: "

git config --global user.name "%git_name%"
git config --global user.email "%git_email%"

echo.
echo ✓ Git configured
echo.

echo ====================================
pause

echo.
echo ====================================
echo   Step 2: Add GitHub Remote
echo ====================================
echo.

set /p github_username="Enter your GitHub username: "

echo.
echo Your repository URL will be:
echo https://github.com/%github_username%/internhub.git
echo.

set /p confirm="Is this correct? (Y/N): "

if /i "%confirm%" NEQ "Y" (
    echo.
    echo Please create your repository on GitHub first, then run this script again.
    pause
    exit /b
)

echo.
echo Checking if git is initialized...
git status >nul 2>&1
if %errorlevel% NEQ 0 (
    echo Initializing git...
    git init
    git branch -M main
) else (
    echo ✓ Git already initialized
)

echo.
echo Adding remote...
git remote remove origin 2>nul
git remote add origin https://github.com/%github_username%/internhub.git
git remote -v

echo.
echo ✓ Remote added
echo.

echo ====================================
pause

echo.
echo ====================================
echo   Step 3: Stage and Commit Files
echo ====================================
echo.

echo Checking status...
git status

echo.
set /p stage_confirm="Stage all files? (Y/N): "

if /i "%stage_confirm%" NEQ "Y" (
    echo Skipping staging. You can manually stage files later.
    pause
    exit /b
)

echo.
echo Adding all files...
git add .

echo.
echo Creating commit...
git commit -m "Initial commit: InternHub platform with RBAC, mentor system, and bug fixes

Features implemented:
- Role-Based Access Control (RoleGuard)
- Mentor-student assignment system (1:1 and 1:Many)
- University advisor management
- Company application management
- Student progress tracking
- Bug fixes for application and advisor fetching
- Persistent login functionality
- Comprehensive documentation"

echo.
echo ✓ Commit created
echo.

echo ====================================
pause

echo.
echo ====================================
echo   Step 4: Push to GitHub
echo ====================================
echo.

echo Pushing main branch...
echo.
echo AUTHENTICATION:
echo - Username: %github_username%
echo - Password: Use your Personal Access Token (NOT your GitHub password)
echo.
echo How to get Personal Access Token:
echo 1. Go to GitHub.com - Settings - Developer settings
echo 2. Personal access tokens - Generate new token
echo 3. Select 'repo' scope
echo 4. Copy token and use as password
echo.

pause

git push -u origin main

if %errorlevel% EQU 0 (
    echo.
    echo ✓ Successfully pushed to GitHub!
    echo.
    echo ====================================
    echo   SUCCESS!
    echo ====================================
    echo.
    echo Your project is now on GitHub:
    echo https://github.com/%github_username%/internhub
    echo.
    echo ====================================
    echo   Next Steps:
    echo ====================================
    echo.
    echo 1. Create develop branch:
    echo    git checkout -b develop
    echo    git push -u origin develop
    echo.
    echo 2. Create feature branches:
    echo    git checkout -b feature/rbac-implementation
    echo    git push -u origin feature/rbac-implementation
    echo.
    echo 3. Go to GitHub and create Pull Requests
    echo.
    echo For complete guide, see:
    echo GITHUB_SETUP_COMPLETE_GUIDE.md
    echo.
) else (
    echo.
    echo ✗ Push failed!
    echo.
    echo Common solutions:
    echo 1. Check your internet connection
    echo 2. Verify repository exists on GitHub
    echo 3. Use Personal Access Token (not password)
    echo 4. Check if repository URL is correct
    echo.
    echo For troubleshooting, see:
    echo GITHUB_SETUP_COMPLETE_GUIDE.md (Section 9)
    echo.
)

pause
