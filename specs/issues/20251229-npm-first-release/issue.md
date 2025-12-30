# First NPM Release - skilluse CLI

## Overview
Complete the first public release of the `skilluse` CLI tool to NPM, enabling users to install via `npm install -g skilluse`.

## Background

The release CI workflow (`release.yml`) is already configured with:
- Multi-platform binary builds (Linux x64/arm64, macOS x64/arm64, Windows x64)
- GitHub Release creation with checksums
- NPM publish step

However, the package has never been published. npm returns 404 for `skilluse`.

## Prerequisites

### 1. Configure NPM_TOKEN Secret

The CI requires an NPM access token to publish:

1. Go to [npmjs.com](https://www.npmjs.com/) and login
2. Click profile icon → Access Tokens
3. Generate New Token → Classic Token → Automation
4. Copy the token (starts with `npm_`)
5. Go to GitHub repo → Settings → Secrets and variables → Actions
6. Add new secret: `NPM_TOKEN` = your token

### 2. Verify Package Configuration

Current `package.json` configuration:
```json
{
  "name": "skilluse",
  "version": "0.1.0",
  "publishConfig": {
    "access": "public"
  }
}
```

## Release Process

### Step 1: Commit and Push Any Pending Changes

```bash
git add .
git commit -m "chore: prepare for v0.1.0 release"
git push origin main
```

### Step 2: Create Version Tag

```bash
# Create annotated tag
git tag -a v0.1.0 -m "Release v0.1.0 - Initial public release"

# Push tag to trigger release workflow
git push origin v0.1.0
```

### Step 3: Monitor Release Workflow

1. Go to GitHub → Actions → Release workflow
2. Verify all jobs complete:
   - `build` (6 platform binaries)
   - `release` (GitHub Release created)
   - `npm` (Published to NPM)

### Step 4: Verify Publication

```bash
# Check NPM registry
npm view skilluse

# Test installation
npm install -g skilluse
skilluse --version
```

## Post-Release: Installation Methods

After successful release, users can install via:

### NPM (Node.js required)
```bash
npm install -g skilluse
# or
npx skilluse
```

### Direct Binary Download
```bash
# macOS/Linux
curl -fsSL https://github.com/jiweiyuan/skilluse/releases/latest/download/skilluse-darwin-arm64 -o skilluse
chmod +x skilluse
./skilluse --version
```

### Install Script (from repo)
```bash
curl -fsSL https://raw.githubusercontent.com/jiweiyuan/skilluse/main/scripts/install.sh | bash
```

## Troubleshooting

### NPM Publish Fails with 401
- Verify NPM_TOKEN is correctly set in GitHub Secrets
- Check token has not expired
- Ensure token has publish permissions

### NPM Publish Fails with 403
- Package name might be taken or too similar to existing package
- Check npm for conflicting packages

### Binary Build Fails
- Check Bun version compatibility
- Review build logs for platform-specific issues

## Future Releases

For subsequent releases:
1. Update version in `package.json`
2. Commit the change
3. Create new tag: `git tag -a v0.1.1 -m "Release v0.1.1"`
4. Push tag: `git push origin v0.1.1`

## Acceptance Criteria
See `features.json` for testable criteria.
