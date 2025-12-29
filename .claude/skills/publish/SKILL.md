---
name: publish
description: Publish a new version via GitHub Actions. Use when user says "publish", "release", or "bump version".
---

# Publish Release

Automate version bumping and release via GitHub Actions workflow.

## Arguments

```
/publish [version-type]
```

- `/publish` - Auto-detect version type from commits (default: patch)
- `/publish patch` - Bug fixes (0.0.X)
- `/publish minor` - New features (0.X.0)
- `/publish major` - Breaking changes (X.0.0)
- `/publish 1.2.3` - Specific version number

## Workflow

```
1. PRE-FLIGHT CHECK    →  Verify clean working tree, on main branch
       ↓
2. ANALYZE CHANGES     →  Review commits since last tag to suggest version
       ↓
3. BUMP VERSION        →  Update package.json version
       ↓
4. COMMIT & TAG        →  Create release commit and git tag
       ↓
5. PUSH                →  Push commit and tag to trigger CI/CD
```

## Instructions

### 1. Pre-flight Check

```bash
# Verify clean state
git status --porcelain
git branch --show-current

# Get current version and last tag
cat packages/cli/package.json | grep '"version"'
git describe --tags --abbrev=0 2>/dev/null || echo "No tags yet"
```

**STOP if:**
- Working tree has uncommitted changes
- Not on main branch (unless user confirms)

### 2. Analyze Changes Since Last Release

```bash
# Show commits since last tag
git log $(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD~10")..HEAD --oneline

# Look for version indicators
# - "feat:" or "feat!:" → minor or major
# - "fix:" → patch
# - "BREAKING CHANGE" → major
```

Suggest version type based on conventional commits:
| Commit Type | Version Bump |
|-------------|--------------|
| `fix:` | PATCH |
| `feat:` | MINOR |
| `feat!:` or `BREAKING CHANGE` | MAJOR |

### 3. Bump Version

```bash
# Read current version
CURRENT=$(grep '"version"' packages/cli/package.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "Current version: $CURRENT"

# Calculate new version (or use user-specified)
# For patch: 0.1.5 → 0.1.6
# For minor: 0.1.5 → 0.2.0
# For major: 0.1.5 → 1.0.0
```

Edit `packages/cli/package.json` to update the version.

### 4. Commit and Tag

Use conventional commit format:

```bash
git add packages/cli/package.json
git commit -m "chore(cli): bump version to X.Y.Z"
git tag vX.Y.Z
```

**DO NOT** add Claude Code references or co-author tags.

### 5. Push to Trigger Release

```bash
git push origin main vX.Y.Z
```

Provide the GitHub Actions URL for monitoring:
```
https://github.com/skilluse/skilluse/actions
```

## Version Calculation Helper

```javascript
// Parse semver: "0.1.5" → [0, 1, 5]
const [major, minor, patch] = version.split('.').map(Number);

// Bump logic
patch: `${major}.${minor}.${patch + 1}`
minor: `${major}.${minor + 1}.0`
major: `${major + 1}.0.0`
```

## Error Handling

| Issue | Action |
|-------|--------|
| Uncommitted changes | Ask user to commit or stash first |
| Not on main | Warn and ask for confirmation |
| Tag already exists | Suggest next version |
| Push fails | Check remote access, show error |

## Post-Publish

After workflow completes, users can verify:
```bash
npm install -g skilluse
skilluse --version
```
