# Optional Authentication for Public Repositories

## Overview

Currently, the CLI requires GitHub authentication for all commands that access repositories, even when accessing public repositories. GitHub's API allows unauthenticated access to public repos (with rate limits). This issue refactors the authentication flow to make login optional for public repo access.

## Problem

All commands that fetch from GitHub require authentication:
- `install` - Returns "Not authenticated" even for public repos
- `search` - Returns "Not authenticated" even for public repos
- `info` - Returns "Not authenticated" even for public repos
- `upgrade` - Returns "Not authenticated" even for public repos
- `repo add` - Returns "Not authenticated" even for public repos
- `list --outdated` - Returns "Not authenticated" even for public repos

Additionally, some commands require authentication unnecessarily:
- `repo list` - Only reads local config
- `repo use` - Only modifies local config
- `repo edit` - Only modifies local config
- `repo remove` - Only modifies local config

## Solution

### Authentication Strategy

```
+----------------------------------------------------------+
|                   Authentication Flow                     |
+----------------------------------------------------------+
|                                                          |
|  1. Local-only operations -> No auth required            |
|     repo list, repo use, repo edit, repo remove          |
|     list (basic), uninstall, agent use                   |
|                                                          |
|  2. GitHub API operations -> Auth optional               |
|     - No token: public repos only (60 req/hr)            |
|     - With token: public + private repos (5000 req/hr)   |
|                                                          |
|  3. Error handling                                       |
|     - 401/403 on private repo -> "Login required"        |
|     - 403 rate limit -> "Login for higher rate limit"    |
|                                                          |
+----------------------------------------------------------+
```

## Requirements

### R1: Remove Mandatory Auth for Local Operations
- `repo list` - Remove `getCredentials()` check
- `repo use` - Remove `getCredentials()` check
- `repo edit` - Remove `getCredentials()` check
- `repo remove` - Remove `getCredentials()` check
- `list` (without --outdated) - Remove `getCredentials()` check

### R2: Make Token Optional in GitHub API Calls
- Create utility function for building headers with optional token
- Update all `fetch()` calls to use optional Authorization header
- Pattern: `headers: token ? { Authorization: \`Bearer ${token}\` } : {}`

### R3: Update Commands with Optional Auth
- `install` - Proceed without token, fail gracefully on private repos
- `search` - Proceed without token, fail gracefully on private repos
- `info` - Check local first, then remote with optional token
- `upgrade` - Proceed without token, fail gracefully on private repos
- `repo add` - Discover skills with optional token
- `list --outdated` - Check updates with optional token

### R4: Improve Error Handling
- Detect 401/403 responses and show "This repository requires authentication"
- Detect 403 rate limit and show "Login to increase rate limit"
- Provide clear guidance: "Run 'skilluse login' to access private repos"

### R5: Update Status Command
- Show "Not logged in" as info, not error
- Still show useful commands even without authentication

## Technical Details

### Helper Function

```typescript
// services/github.ts
export function buildGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function isAuthRequired(response: Response): boolean {
  return response.status === 401 ||
         (response.status === 403 && !isRateLimited(response));
}

export function isRateLimited(response: Response): boolean {
  return response.headers.get("X-RateLimit-Remaining") === "0";
}
```

### Files to Modify

| File | Changes |
|------|---------|
| `services/github.ts` | New file with helper functions |
| `commands/install.tsx` | Make token optional, improve error handling |
| `commands/search.tsx` | Make token optional, improve error handling |
| `commands/info.tsx` | Make token optional, improve error handling |
| `commands/upgrade.tsx` | Make token optional, improve error handling |
| `commands/list.tsx` | Remove auth check for basic list |
| `commands/repo/add.tsx` | Make token optional for discovery |
| `commands/repo/list.tsx` | Remove auth check entirely |
| `commands/repo/use.tsx` | Remove auth check entirely |
| `commands/repo/edit.tsx` | Remove auth check entirely |
| `commands/repo/remove.tsx` | Remove auth check entirely |
| `commands/index.tsx` | Update status display for unauthenticated |

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- Rate limit caching/tracking
- Automatic retry on rate limit
- Token refresh
