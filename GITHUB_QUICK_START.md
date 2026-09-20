# 🚀 GitHub Quick Start - InternHub

## ⚡ Super Quick Setup (5 Minutes)

### **Option 1: Use the Batch Script** (Easiest)

1. Double-click: **`github-setup-quick.bat`**
2. Follow the prompts
3. Done! ✓

### **Option 2: Manual Commands** (Copy & Paste)

```bash
# 1. Navigate to project
cd c:\Users\hp\internhub

# 2. Setup Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 3. Initialize (if needed)
git init
git branch -M main

# 4. Add remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/internhub.git

# 5. Commit and push
git add .
git commit -m "Initial commit: InternHub platform"
git push -u origin main
```

**Authentication:**
- Username: Your GitHub username
- Password: Your **Personal Access Token** (not password!)

---

## 📝 Get Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click: **"Generate new token (classic)"**
3. Name: `InternHub Token`
4. Select scope: ✓ **repo** (full control)
5. Click: **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

---

## 🌳 Create Branch Structure

```bash
# Create and push develop
git checkout -b develop
git push -u origin develop

# Create feature branches
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
```

---

## 🔀 Create Pull Requests

### **On GitHub Website:**

1. Go to: `https://github.com/YOUR_USERNAME/internhub`
2. Click: **"Pull requests"** tab
3. Click: **"New pull request"**
4. Set branches:
   - Base: **`develop`**
   - Compare: **`feature/rbac-implementation`**
5. Click: **"Create pull request"**
6. Fill in title and description
7. Click: **"Create pull request"**

### **Repeat for Other Features:**

- PR #2: `feature/mentor-assignment` → `develop`
- PR #3: `feature/advisor-management` → `develop`
- PR #4: `bugfix/application-fetch` → `develop`

---

## ✅ Merge Pull Requests

### **For Each PR:**

1. Review the code changes
2. Click: **"Merge pull request"**
3. Click: **"Confirm merge"**
4. (Optional) Click: **"Delete branch"**

### **Final Release PR:**

After merging all features to develop:

1. Create PR: `develop` → `main`
2. Title: `Release v1.0.0 - Initial Platform Release`
3. Merge to main
4. Tag the release:

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 🆘 Troubleshooting

### **Problem: Permission denied**

```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/internhub.git
```

### **Problem: Updates rejected**

```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### **Problem: Wrong username/password**

- Use your **Personal Access Token** as password (not GitHub password)
- Generate new token at: https://github.com/settings/tokens

### **Problem: Forgot to add .gitignore**

```bash
# Remove sensitive files
git rm --cached backend/.env
git rm --cached -r backend/node_modules

# Add to .gitignore
echo "backend/.env" >> .gitignore
echo "backend/node_modules/" >> .gitignore

# Commit and push
git add .gitignore
git commit -m "fix: add .gitignore"
git push
```

---

## 📚 Full Documentation

- **Complete Guide:** `GITHUB_SETUP_COMPLETE_GUIDE.md`
- **Workflow Diagrams:** `GITHUB_WORKFLOW_DIAGRAM.md`
- **Push Guide:** `PUSH_TO_GITHUB.md`

---

## 🎯 Daily Workflow

```bash
# Morning
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# During work
git add .
git commit -m "feat: add feature"
git push origin feature/my-feature

# End of day
# Create PR on GitHub
# Request review
# After approval, merge
```

---

## 🎨 Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/name` | `feature/user-login` |
| Bug Fix | `bugfix/name` | `bugfix/form-validation` |
| Hotfix | `hotfix/name` | `hotfix/security-patch` |

---

## ✉️ Commit Messages

```bash
# Good examples
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login error"
git commit -m "docs: update README"
git commit -m "refactor: improve code structure"

# Bad examples
git commit -m "updates"      # Too vague
git commit -m "fix"          # What was fixed?
git commit -m "changes"      # Not descriptive
```

---

## 🔢 Commit Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

---

## 📊 Project Status

After setup, your GitHub will have:

✅ Repository: `internhub`
✅ Main branch: `main`
✅ Develop branch: `develop`
✅ Feature branches: 4 branches
✅ Pull requests: 4-5 PRs
✅ Release tag: `v1.0.0`

---

## 🎉 Next Steps

1. **Enable Branch Protection:**
   - Settings → Branches → Add rule
   - Require PR reviews

2. **Add Collaborators:**
   - Settings → Manage access
   - Invite team members

3. **Create Project Board:**
   - Projects tab
   - Track features and bugs

4. **Setup CI/CD:**
   - GitHub Actions
   - Auto-deploy on merge

---

## 💡 Pro Tips

1. **Commit often** - Small commits are easier to review
2. **Write clear messages** - Your future self will thank you
3. **Pull before push** - Avoid merge conflicts
4. **Keep branches small** - Easier to review and merge
5. **Delete merged branches** - Keep repository clean

---

## 📞 Help Resources

- **Git Docs:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

---

**Ready to push? Run `github-setup-quick.bat` or follow the manual steps above!** 🚀
