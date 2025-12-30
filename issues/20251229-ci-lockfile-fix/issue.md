# CI/CD Lockfile Fix

## Problem

The GitHub CI workflow `cross-platform-build` is failing with:

```
error: lockfile had changes, but lockfile is frozen
note: try re-running without --frozen-lockfile and commit the updated lockfile
```

Bun is detecting that it needs to migrate from `package-lock.json` and the `bun.lock` file has changes.

## Root Cause

The `packages/cli` directory contains multiple lockfiles:
- `bun.lock` - Bun's native lockfile
- `package-lock.json` - npm's lockfile (legacy)
- `pnpm-lock.yaml` - pnpm's lockfile (legacy)

When CI runs `bun install --frozen-lockfile`, bun attempts to migrate from `package-lock.json`, which causes the lockfile to change, failing the frozen check.

## Solution

1. Remove legacy lockfiles (`package-lock.json`, `pnpm-lock.yaml`)
2. Regenerate `bun.lock` with current dependencies
3. Commit the updated `bun.lock`
4. Add legacy lockfiles to `.gitignore`

## Technical Details

### Files to Remove
- `packages/cli/package-lock.json`
- `packages/cli/pnpm-lock.yaml`

### Files to Update
- `packages/cli/bun.lock` - Regenerate
- `packages/cli/.gitignore` - Add lockfile exclusions

### Verification
- CI workflow passes on push to main
- All build jobs succeed (lint-and-build, test, cross-platform-build)

## Acceptance Criteria

See features.json for testable criteria.
