# InternHub GitHub Workflow Diagram

## 🎯 Complete Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. CREATE GITHUB REPO                       │
│                                                                 │
│  GitHub.com → New Repository → "internhub" → Create            │
│  Copy URL: https://github.com/YOUR_USERNAME/internhub.git      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     2. SETUP LOCAL GIT                          │
│                                                                 │
│  cd c:\Users\hp\internhub                                       │
│  git config --global user.name "Your Name"                      │
│  git config --global user.email "your.email@example.com"       │
│  git init                                                       │
│  git remote add origin [YOUR_REPO_URL]                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  3. INITIAL COMMIT & PUSH                       │
│                                                                 │
│  git add .                                                      │
│  git commit -m "Initial commit: InternHub platform"            │
│  git push -u origin main                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   4. CREATE BRANCH STRUCTURE                    │
│                                                                 │
│  main ──────────────────────────────────────────────────►      │
│   │                                                             │
│   └─► develop ──────────────────────────────────────────►      │
│        │                                                        │
│        ├─► feature/rbac-implementation                          │
│        ├─► feature/mentor-assignment                            │
│        ├─► feature/advisor-management                           │
│        └─► bugfix/application-fetch                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    5. CREATE PULL REQUESTS                      │
│                                                                 │
│  Feature Branch ──────► Pull Request ──────► Review            │
│                                                                 │
│  feature/rbac-implementation ──► PR #1 ──► Review ──► Approve  │
│  feature/mentor-assignment   ──► PR #2 ──► Review ──► Approve  │
│  feature/advisor-management  ──► PR #3 ──► Review ──► Approve  │
│  bugfix/application-fetch    ──► PR #4 ──► Review ──► Approve  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      6. MERGE TO DEVELOP                        │
│                                                                 │
│  develop ◄────── feature/rbac-implementation                    │
│          ◄────── feature/mentor-assignment                      │
│          ◄────── feature/advisor-management                     │
│          ◄────── bugfix/application-fetch                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   7. RELEASE TO MAIN (v1.0.0)                   │
│                                                                 │
│  develop ──────► Pull Request ──────► main                      │
│                                        │                        │
│                                        └──► git tag v1.0.0      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Detailed Branch Strategy

```
MAIN BRANCH (main)
├─ Production-ready code only
├─ Protected branch (no direct commits)
├─ Merge only through approved PRs
└─ Tagged with version numbers (v1.0.0, v1.1.0, etc.)

DEVELOP BRANCH (develop)
├─ Integration branch
├─ All features merge here first
├─ Testing happens here
└─ Merge to main when stable

FEATURE BRANCHES (feature/*)
├─ feature/rbac-implementation
│  ├─ RoleGuard component
│  ├─ roleGuard utilities
│  └─ Route protection
├─ feature/mentor-assignment
│  ├─ Backend validation
│  ├─ Frontend filtering
│  └─ Assignment system
├─ feature/advisor-management
│  ├─ Create advisors
│  ├─ Assign students
│  └─ Track progress
└─ bugfix/application-fetch
   ├─ Error handling
   ├─ Token validation
   └─ Consistent messages

HOTFIX BRANCHES (hotfix/*)
└─ Emergency fixes for production
   └─ Merge to both main and develop
```

---

## 🔄 Pull Request Workflow

```
┌─────────────────────────────────────────────────────────┐
│                 DEVELOPER WORKFLOW                      │
└─────────────────────────────────────────────────────────┘

Day 1: Start Feature
─────────────────────
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
[Make changes]
git add .
git commit -m "feat: add new feature"
git push -u origin feature/new-feature

Day 2: Continue Work
────────────────────
git checkout feature/new-feature
[Make more changes]
git add .
git commit -m "feat: enhance feature"
git push

Day 3: Create PR
────────────────
GitHub → Pull Requests → New PR
Base: develop ← Compare: feature/new-feature
Title: "Add new feature"
Description: [Detailed description]
Create Pull Request

Day 4: Review & Merge
─────────────────────
Reviewer reviews code
Reviewer approves
Developer merges PR
Delete feature branch

┌─────────────────────────────────────────────────────────┐
│              PULL REQUEST LIFECYCLE                     │
└─────────────────────────────────────────────────────────┘

Create PR
    ↓
Automatic Checks
    ├─ Code style ✓
    ├─ Tests pass ✓
    └─ Conflicts? ✗ → Fix conflicts
    ↓
Code Review
    ├─ Request changes → Make changes → Push
    └─ Approve ✓
    ↓
Merge to develop
    ↓
Delete feature branch
    ↓
Done!
```

---

## 🚀 Release Process

```
┌──────────────────────────────────────────────────────────────┐
│                    RELEASE PROCESS                           │
└──────────────────────────────────────────────────────────────┘

Step 1: All features merged to develop
───────────────────────────────────────
develop branch contains:
├─ All completed features
├─ All bug fixes
└─ All tested code

Step 2: Create release PR
─────────────────────────
GitHub → Pull Requests → New PR
Base: main ← Compare: develop
Title: "Release v1.0.0 - Initial Platform Release"
Description:
├─ List all features
├─ List all bug fixes
└─ Breaking changes (if any)

Step 3: Final testing on develop
────────────────────────────────
├─ Run all tests
├─ Manual QA
└─ Performance check

Step 4: Merge to main
────────────────────
Merge PR to main
Delete branch? No (keep develop)

Step 5: Tag release
──────────────────
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

Step 6: Deploy
─────────────
Deploy from main branch to production

┌──────────────────────────────────────────────────────────────┐
│                  VERSION NUMBERING                           │
└──────────────────────────────────────────────────────────────┘

v MAJOR . MINOR . PATCH

v1.0.0 - Initial release
v1.0.1 - Bug fix
v1.1.0 - New feature (backward compatible)
v2.0.0 - Breaking change

Examples:
├─ Bug fix:     v1.0.0 → v1.0.1
├─ New feature: v1.0.1 → v1.1.0
└─ Breaking:    v1.1.0 → v2.0.0
```

---

## 📅 Daily Git Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                   MORNING ROUTINE                            │
└──────────────────────────────────────────────────────────────┘

1. Update develop branch
   ─────────────────────
   git checkout develop
   git pull origin develop

2. Create/switch to feature branch
   ────────────────────────────────
   git checkout feature/my-feature
   # OR create new
   git checkout -b feature/new-feature

3. Start coding
   ────────────
   [Make changes to files]

┌──────────────────────────────────────────────────────────────┐
│                   DURING THE DAY                             │
└──────────────────────────────────────────────────────────────┘

Commit often:
─────────────
git add .
git commit -m "feat: add login form"
[more changes]
git add .
git commit -m "feat: add validation"
[more changes]
git add .
git commit -m "feat: add error handling"

Push to remote:
───────────────
git push origin feature/my-feature

┌──────────────────────────────────────────────────────────────┐
│                   END OF DAY                                 │
└──────────────────────────────────────────────────────────────┘

1. Final commit and push
   ──────────────────────
   git add .
   git commit -m "feat: complete login feature"
   git push origin feature/my-feature

2. Create PR (if feature complete)
   ────────────────────────────────
   GitHub → New Pull Request
   Base: develop ← Compare: feature/my-feature

3. Review tomorrow
   ───────────────
   Get feedback
   Make changes if needed
   Merge when approved
```

---

## 🔀 Merge Strategies

```
┌──────────────────────────────────────────────────────────────┐
│                   MERGE COMMIT                               │
└──────────────────────────────────────────────────────────────┘

main        A───B───────────M
                 \         /
feature           C───D───E

✓ Preserves full history
✓ Shows when feature was merged
✓ Easy to revert entire feature
✗ Creates merge commits

Use for: Important features


┌──────────────────────────────────────────────────────────────┐
│                  SQUASH AND MERGE                            │
└──────────────────────────────────────────────────────────────┘

main        A───B───C'
                 
feature           C───D───E
                 (squashed into C')

✓ Clean linear history
✓ One commit per feature
✗ Loses individual commit history
✗ Harder to debug

Use for: Small features, bug fixes


┌──────────────────────────────────────────────────────────────┐
│                  REBASE AND MERGE                            │
└──────────────────────────────────────────────────────────────┘

main        A───B───C───D───E
                
feature           C───D───E
                 (replayed on top)

✓ Clean linear history
✓ Keeps individual commits
✗ Changes commit hashes
✗ Can be confusing

Use for: Personal branches, clean history needed
```

---

## 🎨 Visual Example: InternHub Project

```
TIMELINE VIEW
─────────────

Week 1: Initial Setup
─────────────────────
main        [Initial commit]────►

Week 2: Create Branches
───────────────────────
main        [Initial commit]────────────────────────►
             │
develop      └──[Create develop]────────────────────►
              │
rbac          ├──[Add RoleGuard]──[Add utils]──────►
mentor        ├──[Backend]──[Frontend]──────────────►
advisor       └──[Create]──[Assign]──[Track]────────►

Week 3: Merge Features
──────────────────────
main        [Initial commit]────────────────────────►
             │
develop      └──[Create]──◄[rbac]──◄[mentor]────────►
                                    ◄[advisor]

Week 4: Release
───────────────
main        [Initial commit]──────────◄[develop]────► v1.0.0
                                                      (Tagged)
develop      ─────────────────────────────────────────►

CURRENT STATE
─────────────
main        : v1.0.0 (production)
develop     : Latest features (testing)
feature/*   : Active development
```

---

## 📋 Checklist Format

```
BEFORE PUSHING TO GITHUB
────────────────────────
☐ Remove sensitive files (.env, secrets)
☐ Update .gitignore
☐ Test the application
☐ Write README.md
☐ Add documentation
☐ Create repository on GitHub
☐ Get Personal Access Token

CREATING REPOSITORY
───────────────────
☐ Login to GitHub
☐ Click "New repository"
☐ Name: internhub
☐ Description: Added
☐ Private/Public: Selected
☐ Don't initialize with README
☐ Copy repository URL

INITIAL PUSH
────────────
☐ git init (if needed)
☐ git config user.name
☐ git config user.email
☐ git remote add origin [URL]
☐ git add .
☐ git commit -m "Initial commit"
☐ git push -u origin main
☐ Verify on GitHub

CREATING BRANCHES
─────────────────
☐ Create develop branch
☐ Push develop branch
☐ Create feature branches
☐ Push feature branches
☐ Verify all branches on GitHub

CREATING PULL REQUESTS
──────────────────────
☐ Create PR for each feature
☐ Add description
☐ Add screenshots (if UI)
☐ Link related issues
☐ Request reviewers
☐ Wait for approval

MERGING
───────
☐ All checks passed
☐ Code reviewed
☐ Approved
☐ Merge to develop
☐ Delete feature branch
☐ Test on develop
☐ Create release PR
☐ Merge to main
☐ Tag release
☐ Deploy
```

---

## 🎯 Quick Command Reference

```bash
# Initialize and setup
git init
git remote add origin [URL]
git branch -M main

# Daily workflow
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
git add .
git commit -m "message"
git push origin feature/new-feature

# Merge workflow
git checkout develop
git merge feature/new-feature
git push origin develop

# Release workflow
git checkout main
git merge develop
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0

# Branch management
git branch                    # List local
git branch -a                 # List all
git branch -d feature/name    # Delete local
git push origin --delete feature/name  # Delete remote

# Undo/Fix
git reset --soft HEAD~1       # Undo last commit
git checkout -- filename      # Discard changes
git stash                     # Save changes temporarily
```

This diagram provides a complete visual reference for your GitHub workflow! 🚀
