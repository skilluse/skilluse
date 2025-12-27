# Authentication Commands

## Overview
Implement CLI commands for authentication: login, logout, and whoami.

## Requirements
- `skilluse login` - Start GitHub OAuth authentication
- `skilluse logout` - Clear stored authentication
- `skilluse whoami` - Show current authenticated user

## Technical Details

### Command Implementations

**login.tsx**
```tsx
// 1. Check if already logged in
// 2. Start OAuth Device Flow
// 3. Show spinner + user code
// 4. Wait for completion
// 5. Store token
// 6. Show success with username
```

**logout.tsx**
```tsx
// 1. Check if logged in
// 2. Clear stored token
// 3. Show success message
```

**whoami.tsx**
```tsx
// 1. Check if logged in
// 2. Fetch user info from GitHub
// 3. Display username and avatar URL
```

### UI Components Used
- Spinner (waiting for auth)
- StatusMessage (success/error)
- Box (layout)

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task01-project-setup
- [x] task02-ui-components
- [x] task03-oauth-flow
- [x] task05-config-store

## Out of Scope
- Token refresh (auto-handled by octokit)
- Multiple account support
