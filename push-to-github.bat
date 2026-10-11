@echo off
echo ========================================
echo PUSH TO GITHUB (Excluding Documentation)
echo ========================================
echo.

echo Step 1: Adding all code files (excluding docs)...
git add .

echo.
echo Step 2: Creating commit...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Update code - exclude documentation"

git commit -m "%commit_message%"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo PUSH COMPLETE!
echo ========================================
echo.
echo Documentation files (.md, .txt, .pdf) were NOT pushed.
echo Only code files were uploaded to GitHub.
echo.
pause
