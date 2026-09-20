# Complete GitHub Setup Guide for InternHub

## 📋 Table of Contents
1. [Create GitHub Repository](#1-create-github-repository)
2. [Setup Git Locally](#2-setup-git-locally)
3. [Create Branch Structure](#3-create-branch-structure)
4. [Push to GitHub](#4-push-to-github)
5. [Create Pull Requests](#5-create-pull-requests)
6. [Merge Branches](#6-merge-branches)
7. [Best Practices](#7-best-practices)

---

## 1. Create GitHub Repository

### **Step 1.1: Login to GitHub**
1. Go to [GitHub.com](https://github.com)
2. Login with your credentials

### **Step 1.2: Create New Repository**

#### **Option A: Using GitHub Website (Recommended)**

1. Click the **"+"** icon in top-right corner
2. Select **"New repository"**
3. Fill in repository details:
   ```
   Repository name: internhub
   Description: Internship Management Platform - Connecting Students, Universities, and Companies
   
   Visibility: 
   ○ Public (anyone can see)
   ● Private (only you can see)
   
   ☐ Add a README file (DON'T check this - we already have files)
   ☐ Add .gitignore (DON'T check - we have one)
   ☐ Choose a license (Optional - select MIT if you want)
   ```
4. Click **"Create repository"**

#### **Option B: Using GitHub CLI (Alternative)**

```bash
# If you have GitHub CLI installed
gh repo create internhub --private --source=. --remote=origin
```

### **Step 1.3: Copy Repository URL**

After creating, you'll see a URL like:
```
https://github.com/YOUR_USERNAME/internhub.git
```

**Save this URL - you'll need it!**

---

## 2. Setup Git Locally

### **Step 2.1: Check Git Installation**

Open Command Prompt or PowerShell:

```bash
# Check if git is installed
git --version
```

**Expected output:** `git version 2.x.x`

If not installed, download from: https://git-scm.com/download/win

### **Step 2.2: Configure Git**

Set your identity (only needed once):

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use the same email as your GitHub account)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

### **Step 2.3: Navigate to Your Project**

```bash
cd c:\Users\hp\internhub
```

### **Step 2.4: Initialize Git (If Not Already)**

```bash
# Check if git is already initialized
git status

# If you see "fatal: not a git repository", initialize:
git init
```

### **Step 2.5: Add Remote Repository**

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/internhub.git

# Verify remote was added
git remote -v
```

**Expected output:**
```
origin  https://github.com/YOUR_USERNAME/internhub.git (fetch)
origin  https://github.com/YOUR_USERNAME/internhub.git (push)
```

---

## 3. Create Branch Structure

### **Recommended Branch Structure for InternHub:**

```
main (production-ready code)
  ├── develop (integration branch)
  │   ├── feature/rbac-implementation
  │   ├── feature/mentor-assignment
  │   ├── feature/advisor-management
  │   └── bugfix/application-fetch
  └── hotfix/* (emergency fixes)
```

### **Step 3.1: Create and Setup Main Branch**

```bash
# Create main branch
git branch -M main

# Check current branch
git branch
```

### **Step 3.2: Create Develop Branch**

```bash
# Create develop branch from main
git checkout -b develop

# Push develop branch to GitHub
git push -u origin develop

# Go back to main
git checkout main
```

### **Step 3.3: Create Feature Branches**

```bash
# Create branch for RBAC feature
git checkout -b feature/rbac-implementation

# Create branch for mentor assignment
git checkout -b feature/mentor-assignment

# Create branch for advisor management
git checkout -b feature/advisor-management

# Create branch for bug fixes
git checkout -b bugfix/application-fetch

# View all branches
git branch -a
```

---

## 4. Push to GitHub

### **Step 4.1: Check What Files Will Be Pushed**

```bash
# Go back to main branch
git checkout main

# See what files are tracked/untracked
git status

# See what changes were made
git diff
```

### **Step 4.2: Create .gitignore (Important!)**

Before pushing, make sure sensitive files are ignored:

```bash
# View current .gitignore
type backend\.gitignore
type frontend\internhub\.gitignore
```

**Verify these are in your .gitignore files:**

**Backend `.gitignore`:**
```
node_modules/
.env
*.log
uploads/
.DS_Store
```

**Frontend `.gitignore`:**
```
node_modules/
.next/
.env
.env.local
.env.production
*.log
.DS_Store
```

### **Step 4.3: Stage All Files**

```bash
# Add all files to staging
git add .

# Check what's staged
git status
```

### **Step 4.4: Create Initial Commit**

```bash
# Create commit with descriptive message
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
```

### **Step 4.5: Push Main Branch**

```bash
# Push main branch to GitHub
git push -u origin main
```

**If you get authentication prompt:**
- Username: Your GitHub username
- Password: Your **Personal Access Token** (NOT your GitHub password)

**How to create Personal Access Token:**
1. Go to GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic) → Generate new token
3. Select scopes: `repo` (full control)
4. Copy the token (save it somewhere - you won't see it again!)
5. Use this token as your password

### **Step 4.6: Push Develop Branch**

```bash
# Switch to develop
git checkout develop

# Merge main into develop
git merge main

# Push develop
git push -u origin develop
```

### **Step 4.7: Push Feature Branches**

```bash
# Push RBAC feature
git checkout feature/rbac-implementation
git merge main
git push -u origin feature/rbac-implementation

# Push mentor assignment feature
git checkout feature/mentor-assignment
git merge main
git push -u origin feature/mentor-assignment

# Push advisor management feature
git checkout feature/advisor-management
git merge main
git push -u origin feature/advisor-management

# Push bug fix branch
git checkout bugfix/application-fetch
git merge main
git push -u origin bugfix/application-fetch
```

---

## 5. Create Pull Requests

### **What is a Pull Request (PR)?**
A Pull Request is a way to propose changes and review code before merging into main branches.

### **Step 5.1: Create PR for RBAC Feature**

#### **Using GitHub Website:**

1. Go to your repository: `https://github.com/YOUR_USERNAME/internhub`
2. Click **"Pull requests"** tab
3. Click **"New pull request"**
4. Set:
   - **Base branch:** `develop`
   - **Compare branch:** `feature/rbac-implementation`
5. Click **"Create pull request"**
6. Fill in details:
   ```
   Title: Add Role-Based Access Control (RBAC)
   
   Description:
   ## Summary
   Implemented comprehensive RBAC system with RoleGuard component
   
   ## Changes
   - Created RoleGuard component for route protection
   - Added roleGuard utility functions
   - Wrapped company and university pages with role checks
   - Added automatic redirection to correct dashboards
   - Implemented token validation with 5-minute buffer
   
   ## Testing
   - ✅ Company users can access company pages
   - ✅ University users can access university pages
   - ✅ Users get redirected if accessing wrong dashboard
   - ✅ Token expiration handled gracefully
   
   ## Related Issues
   Fixes #1 (if you have issues created)
   
   ## Documentation
   - Added ROLE_BASED_ACCESS_CONTROL.md
   ```
7. Click **"Create pull request"**

#### **Using GitHub CLI:**

```bash
gh pr create --base develop --head feature/rbac-implementation --title "Add Role-Based Access Control (RBAC)" --body "Implemented comprehensive RBAC system..."
```

### **Step 5.2: Create More Pull Requests**

Repeat for other features:

**PR #2: Mentor Assignment System**
```
Base: develop
Compare: feature/mentor-assignment
Title: Implement Mentor-Student Assignment System

Description:
- 1:1 student-mentor relationship
- 1:Many mentor-students relationship
- Backend validation for duplicate assignments
- Frontend filtering for unassigned students
```

**PR #3: Advisor Management**
```
Base: develop
Compare: feature/advisor-management
Title: Add University Advisor Management

Description:
- Create and manage advisors
- Assign students to advisors
- Track student progress
- Record attendance and evaluations
```

**PR #4: Bug Fixes**
```
Base: develop
Compare: bugfix/application-fetch
Title: Fix Application and Advisor Fetching Bugs

Description:
- Enhanced error handling
- Fixed 403 permission errors
- Added token validation
- Consistent error messages
```

---

## 6. Merge Branches

### **Step 6.1: Review Pull Requests**

On GitHub:
1. Go to each Pull Request
2. Review the **"Files changed"** tab
3. Leave comments if needed
4. Approve the PR

### **Step 6.2: Merge Feature PRs into Develop**

For each PR:

1. On GitHub PR page, click **"Merge pull request"**
2. Choose merge type:
   - **Merge commit** (recommended) - keeps full history
   - **Squash and merge** - combines all commits into one
   - **Rebase and merge** - linear history
3. Click **"Confirm merge"**
4. Optionally, click **"Delete branch"** to clean up

**Or using command line:**

```bash
# Switch to develop
git checkout develop

# Merge feature branch
git merge feature/rbac-implementation

# Push updated develop
git push origin develop

# Delete local feature branch (optional)
git branch -d feature/rbac-implementation

# Delete remote feature branch (optional)
git push origin --delete feature/rbac-implementation
```

### **Step 6.3: Create PR from Develop to Main**

After merging all features into develop:

1. Create a new PR:
   - **Base:** `main`
   - **Compare:** `develop`
2. Title: `Release v1.0.0 - Initial Platform Release`
3. Description: List all features included
4. Merge the PR

**Command line:**

```bash
# Create release PR
gh pr create --base main --head develop --title "Release v1.0.0 - Initial Platform Release"

# Or merge directly (if you're sure)
git checkout main
git merge develop
git push origin main
```

### **Step 6.4: Create a Release Tag**

```bash
# Create a tag for the release
git tag -a v1.0.0 -m "Release v1.0.0 - Initial InternHub Platform

Features:
- Role-Based Access Control
- Mentor-Student Assignment
- Advisor Management
- Application Management
- Bug Fixes and Enhancements"

# Push tag to GitHub
git push origin v1.0.0
```

---

## 7. Best Practices

### **Branch Naming Conventions**

| Branch Type | Naming | Example |
|-------------|--------|---------|
| **Feature** | `feature/description` | `feature/user-authentication` |
| **Bug Fix** | `bugfix/description` | `bugfix/login-error` |
| **Hotfix** | `hotfix/description` | `hotfix/security-patch` |
| **Release** | `release/version` | `release/1.0.0` |

### **Commit Message Best Practices**

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(auth): add JWT token refresh mechanism"
git commit -m "fix(advisor): resolve permission error in fetchAdvisors"
git commit -m "docs: add comprehensive GitHub setup guide"
```

### **Pull Request Best Practices**

1. **Keep PRs Small** - Easier to review
2. **Write Clear Descriptions** - Explain what and why
3. **Add Screenshots** - For UI changes
4. **Link Issues** - Reference related issues
5. **Request Reviews** - Get feedback before merging
6. **Pass Tests** - Ensure CI/CD checks pass

### **Daily Git Workflow**

```bash
# Start your day
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit often
git add .
git commit -m "feat: add new feature"

# Push to remote
git push -u origin feature/new-feature

# Create PR on GitHub
# After approval, merge to develop
# Delete feature branch
```

---

## 8. Quick Reference Commands

### **Essential Git Commands**

```bash
# Check status
git status

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# Add files
git add .                    # All files
git add filename.txt         # Specific file

# Commit
git commit -m "message"

# Push
git push origin branch-name

# Pull latest changes
git pull origin branch-name

# Merge branch
git merge branch-name

# View branches
git branch                   # Local
git branch -a                # All (local + remote)

# Delete branch
git branch -d branch-name    # Local
git push origin --delete branch-name  # Remote

# View commit history
git log --oneline
git log --graph --oneline --all

# Undo changes
git checkout -- filename     # Discard local changes
git reset HEAD filename      # Unstage file
git reset --soft HEAD~1      # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (discard changes)

# Stash changes
git stash                    # Save changes temporarily
git stash pop                # Apply stashed changes
git stash list               # View stashes
```

### **GitHub CLI Commands**

```bash
# Create repository
gh repo create name --private

# Create PR
gh pr create --base main --head feature-branch

# View PRs
gh pr list

# Checkout PR
gh pr checkout PR-number

# Merge PR
gh pr merge PR-number

# View repository
gh repo view
```

---

## 9. Troubleshooting

### **Problem: "Permission denied (publickey)"**

**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/internhub.git
```

### **Problem: "Updates were rejected"**

**Solution:**
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### **Problem: "Merge conflict"**

**Solution:**
```bash
# 1. Git will mark conflicts in files
# 2. Open conflicted files
# 3. Look for <<<<<<< HEAD markers
# 4. Edit to resolve conflicts
# 5. Remove conflict markers
# 6. Add and commit

git add .
git commit -m "fix: resolve merge conflicts"
git push
```

### **Problem: "Forgot to create .gitignore, pushed .env file"**

**Solution:**
```bash
# Remove from git but keep local file
git rm --cached backend/.env
git rm --cached -r backend/node_modules

# Add to .gitignore
echo "backend/.env" >> .gitignore
echo "backend/node_modules/" >> .gitignore

# Commit and push
git add .gitignore
git commit -m "fix: remove sensitive files from git"
git push

# IMPORTANT: Change all passwords/secrets in .env!
```

### **Problem: "Need to undo last commit"**

**Solution:**
```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes (CAREFUL!)
git reset --hard HEAD~1
```

---

## 10. Complete Step-by-Step Workflow

### **Complete Commands (Copy & Paste)**

```bash
# STEP 1: Navigate to project
cd c:\Users\hp\internhub

# STEP 2: Configure Git (if not done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# STEP 3: Initialize Git (if needed)
git init
git branch -M main

# STEP 4: Add remote
git remote add origin https://github.com/YOUR_USERNAME/internhub.git

# STEP 5: Stage and commit all files
git add .
git commit -m "Initial commit: InternHub platform

Features:
- Role-Based Access Control
- Mentor-Student Assignment System
- Advisor Management
- Bug fixes and enhancements"

# STEP 6: Push main branch
git push -u origin main

# STEP 7: Create and push develop branch
git checkout -b develop
git push -u origin develop

# STEP 8: Create feature branches
git checkout -b feature/rbac-implementation
git push -u origin feature/rbac-implementation

git checkout develop
git checkout -b feature/mentor-assignment
git push -u origin feature/mentor-assignment

git checkout develop
git checkout -b feature/advisor-management
git push -u origin feature/advisor-management

git checkout develop
git checkout -b bugfix/application-fetch
git push -u origin bugfix/application-fetch

# STEP 9: Go to GitHub and create Pull Requests

# STEP 10: Merge PRs on GitHub

# STEP 11: Create release tag
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 11. Visual Guide

### **Git Branch Flow Diagram**

```
main (production)
 │
 │  [Initial commit]
 ├─────────────────────────────────────────► (v1.0.0)
 │                                             ▲
 │                                             │
develop                                        │
 │                                             │
 │  [Create develop]                           │
 ├─────────────────────────────────────────────┤
 │                                             │
 ├──► feature/rbac-implementation              │
 │    - Add RoleGuard                          │
 │    - Add roleGuard utilities                │
 │    └────────────────────────────► [Merge]──┤
 │                                             │
 ├──► feature/mentor-assignment                │
 │    - Backend validation                     │
 │    - Frontend filtering                     │
 │    └────────────────────────────► [Merge]──┤
 │                                             │
 ├──► feature/advisor-management               │
 │    - Create advisors                        │
 │    - Assign students                        │
 │    └────────────────────────────► [Merge]──┤
 │                                             │
 ├──► bugfix/application-fetch                 │
 │    - Fix error handling                     │
 │    - Add token validation                   │
 │    └────────────────────────────► [Merge]──┘
 │
 └────────────────────────────────────────────►
```

---

## 12. Next Steps After Setup

1. **Add README badges:**
   ```markdown
   ![GitHub](https://img.shields.io/github/license/YOUR_USERNAME/internhub)
   ![GitHub last commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/internhub)
   ![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/internhub)
   ```

2. **Set up GitHub Actions (CI/CD):**
   - Automatically run tests on PR
   - Deploy on merge to main

3. **Enable Branch Protection:**
   - Settings → Branches → Add rule
   - Require PR reviews before merging
   - Require status checks to pass

4. **Create Project Board:**
   - Track features and bugs
   - Use Issues for task management

5. **Add Contributors:**
   - Settings → Manage access → Invite collaborators

---

## 📞 Need Help?

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

---

**Good luck with your InternHub project! 🚀**
