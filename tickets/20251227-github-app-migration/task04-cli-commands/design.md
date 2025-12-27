# Task 04: Update CLI Commands

## Overview

Update the login, logout, and whoami commands to work with GitHub App authentication. Add installation management flow to login process.

## Requirements

- Login: Authenticate user and guide through app installation
- Logout: Clear all credentials and cached tokens
- Whoami: Show user info and installation status
- New command: `repos` to view accessible repositories

## Technical Details

### Login Command Flow

```
1. Start device flow
2. User authenticates in browser
3. Get user access token
4. Check for existing installations
   - If none: prompt to install app
   - If exists: show installation summary
5. Store credentials
```

#### Login UI States

```typescript
type LoginState =
  | { phase: "checking" }
  | { phase: "already_logged_in"; username: string }
  | { phase: "requesting_code" }
  | { phase: "waiting_for_auth"; userCode: string; verificationUri: string }
  | { phase: "fetching_installations" }
  | { phase: "no_installation"; installUrl: string }
  | { phase: "success"; username: string; installations: Installation[] }
  | { phase: "error"; message: string };
```

#### Installation Prompt

When no installation found:
```
You need to install Skilluse CLI on your GitHub account.

Open: https://github.com/apps/skilluse-cli/installations/new

Press Enter after installing, or Ctrl+C to cancel...
```

### Logout Command

- Clear user token from keychain
- Clear installation list from config
- Clear cached installation tokens
- Show confirmation message

### Whoami Command

Display:
```
Logged in as: username

GitHub App Installations:
  - username (personal) - 3 repositories
  - org-name (organization) - all repositories

Use 'skilluse repos' to see accessible repositories.
```

### New: Repos Command

```
skilluse repos [--installation <id>]
```

Display:
```
Accessible Repositories:

username (personal):
  - skilluse/my-skills (private)
  - skilluse/shared-skills (public)

org-name:
  - org-name/team-skills (private)
```

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- task02-oauth-service (for GitHub App APIs)
- task03-credential-storage (for storing credentials)

## Out of Scope

- Installation modification (add/remove repos from CLI)
- Organization admin features
