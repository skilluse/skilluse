# Support GitHub URLs in Repo Add Command

## Overview

Enhance the `skilluse repo add` command to accept full GitHub HTTPS URLs in addition to the existing `owner/repo` format.

## Requirements

- Accept full GitHub URLs: `https://github.com/owner/repo`
- Continue supporting existing `owner/repo` format
- Extract and validate `owner/repo` from URL

## Technical Details

### URL Parsing

Create a utility function `parseGitHubRepo(input: string)` that:

```typescript
// Returns { owner: string; repo: string } or null if invalid
function parseGitHubRepo(input: string): { owner: string; repo: string } | null;

// Supported formats:
parseGitHubRepo("owner/repo")                     // { owner, repo }
parseGitHubRepo("https://github.com/owner/repo")  // { owner, repo }
parseGitHubRepo("invalid")                        // null
```

### Files to Modify

1. `packages/cli/src/services/github.ts` - Add `parseGitHubRepo()` utility
2. `packages/cli/src/commands/repo/add.tsx` - Use parser instead of direct validation

### Current Validation (to replace)

```typescript
// Current: packages/cli/src/commands/repo/add.tsx:75
if (!repoArg.match(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/)) {
  setState({ phase: "invalid_repo" });
  return;
}
```

### New Validation

```typescript
const parsed = parseGitHubRepo(repoArg);
if (!parsed) {
  setState({ phase: "invalid_repo" });
  return;
}
const { owner, repo } = parsed;
const repoIdentifier = `${owner}/${repo}`;
// Use repoIdentifier for the rest of the flow
```

## Acceptance Criteria

See `feature.json` for testable criteria.

## Issue Dependencies

- None (standalone enhancement)

## Out of Scope

- SSH URLs (`git@github.com:owner/repo.git`)
- Short URLs without protocol (`github.com/owner/repo`)
- URLs with `.git` suffix
- Non-GitHub hosts (GitLab, Bitbucket)
