# Publishing Guide for GROK-CODE CLI

## 1. Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: GROK-CODE CLI v1.0.0 - AI-Powered Development Assistant"

# Add remote origin
git remote add origin https://github.com/AiGent47-DevLabs/Grok-Code-CLI.git

# Push to main branch
git push -u origin main
```

## 2. Create GitHub Release

1. Go to https://github.com/AiGent47-DevLabs/Grok-Code-CLI/releases
2. Click "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `GROK-CODE CLI v1.0.0`
5. Description: Copy from CHANGELOG.md

## 3. Publish to npm

```bash
# Login to npm (if not already)
npm login

# Publish the package
npm publish

# Verify it's live
npm info @aigent47-devlabs/grok-code-cli
```

## 4. Test Installation

```bash
# Test global installation
npm install -g @aigent47-devlabs/grok-code-cli

# Run it
grok /help
```

## 5. Announce! 🎉

- Tweet/Post about your new CLI tool
- Share on Reddit (r/programming, r/node)
- Post on Dev.to or Medium
- Add to your LinkedIn

---

Remember: Your package name on npm is `@aigent47-devlabs/grok-code-cli` (scoped)
Your GitHub repo is `Grok-Code-CLI` (capitalized) 