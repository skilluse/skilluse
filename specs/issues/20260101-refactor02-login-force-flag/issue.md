# Remove --force flag from login command

## Overview

The `--force` flag on `skilluse login` is unnecessary. Modern CLIs (gh, npm, vercel, docker) allow re-authentication without requiring a force flag. Simply running `login` again should re-authenticate.

## Requirements

- Remove the `--force` option from the login command
- Running `skilluse login` when already authenticated should start a new authentication flow
- Remove the "Already logged in" check that skips authentication

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `packages/cli/src/commands/login.tsx` | Remove force option and skip-if-logged-in logic |

### Current Behavior

```typescript
export const options = z.object({
  force: z
    .boolean()
    .default(false)
    .describe("Force re-authentication even if already logged in"),
});

// In component:
if (!opts.force) {
  const existing = await getCredentials();
  if (existing) {
    setState({ phase: "already_logged_in", username: existing.user });
    exit();
    return;
  }
}
```

### New Behavior

```typescript
export const options = z.object({});

// Always proceed with authentication flow
```

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- Changes to logout command
- Changes to credential storage
