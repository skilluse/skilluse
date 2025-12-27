# Task 01: Create GitHub App

## Overview

Register a new GitHub App to replace the existing OAuth App. Configure appropriate permissions and settings for CLI authentication with fine-grained repository access.

## Introduction

### Why GitHub App Instead of OAuth App?

GitHub Apps are the recommended way to integrate with GitHub. Compared to OAuth Apps:

| Feature | OAuth App | GitHub App |
|---------|-----------|------------|
| Permission granularity | Broad scopes (e.g., `repo`) | Fine-grained per-resource |
| Rate limits | 5,000/hour per user | 5,000/hour + installation bonus |
| Installation | User-level only | User or organization level |
| Token expiration | Optional | Configurable |
| Audit logging | Limited | Full audit trail |

### How Device Flow Works

The Device Flow is designed for CLI tools and devices without browsers:

```
1. CLI requests device code from GitHub
2. GitHub returns: user_code + verification_url
3. CLI displays: "Go to github.com/login/device and enter: ABCD-1234"
4. User opens browser, enters code, authorizes app
5. CLI polls GitHub until authorization completes
6. GitHub returns access token
7. CLI stores token securely (keychain)
```

This flow is secure because:
- No secrets stored in CLI binary
- User authenticates directly with GitHub
- Token never passes through third-party servers

## Requirements

- Create GitHub App at https://github.com/settings/apps/new
- Configure minimal permissions for skill repository access
- Enable Device Flow for CLI authentication
- Store App ID and Client ID in codebase

## Technical Details

### GitHub App Creation Form

Navigate to https://github.com/settings/apps/new and configure each section:

#### Basic Information

| Field | Value | Notes |
|-------|-------|-------|
| **GitHub App name** | `Skilluse CLI` | Displayed to users when authorizing. Must be unique across GitHub. |
| **Description** | See below | Shown on authorization page when users log in |
| **Homepage URL** | `https://skilluse.dev` | Full URL to app's website |

**Description (Introduction)** - This text is displayed to users on the authorization page:

```
Skilluse CLI helps you discover, install, and manage AI coding agent skills
from GitHub repositories. This app needs read access to browse skill
repositories and install skills to your local environment.
```

#### Identifying and Authorizing Users

| Field | Value | Notes |
|-------|-------|-------|
| **Callback URL** | `http://localhost` | Redirect URL after OAuth web flow (not used for Device Flow but required) |
| **Expire user authorization tokens** | Unchecked | No refresh token needed for CLI use |
| **Request user authorization (OAuth) during installation** | Unchecked | We use Device Flow, not installation-time auth |
| **Enable Device Flow** | **Checked** | **Required** - This enables `skilluse login` to work |

#### Post Installation

| Field | Value | Notes |
|-------|-------|-------|
| **Setup URL** | (leave empty) | No additional setup needed |
| **Redirect on update** | Unchecked | Not applicable |

#### Webhook

| Field | Value | Notes |
|-------|-------|-------|
| **Active** | Unchecked | CLI doesn't need webhooks |
| **Webhook URL** | (leave empty) | Not applicable |
| **Secret** | (leave empty) | Not applicable |

#### Permissions

**Repository permissions** (permit access to repositories):

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| **Contents** | Read | Read skill files from repos |
| **Metadata** | Read | List repos, get repo info (auto-granted with Contents) |

**Organization permissions**: None required

**Account permissions**: None required

#### Subscribe to Events

No events needed - leave all unchecked.

#### Installation Target

| Option | Recommendation |
|--------|----------------|
| **Only on this account** | For development/testing |
| **Any account** | **Select this** for public release |

### After Creation

GitHub will generate:

1. **App ID** - Numeric ID
2. **Client ID** - String starting with `Iv`

**Skilluse CLI GitHub App:**

| Field | Value | Public? |
|-------|-------|---------|
| App ID | `2548823` | ✅ Yes - just an identifier |
| Client ID | `Iv23liOOBSjdH2IRT6W2` | ✅ Yes - designed to be embedded in client apps |
| Client Secret | (not needed) | ❌ Private - only for web app backends |
| Private Key | (not needed) | ❌ Private - only for server-to-server auth |

> **Note:** You do NOT need to generate a private key for Device Flow authentication.
> The "You must generate a private key" message can be safely ignored for CLI use.

### Configuration File

Create `packages/cli/src/config/github-app.ts`:

```typescript
export const GITHUB_APP_CONFIG = {
  appId: "2548823",
  clientId: "Iv23liOOBSjdH2IRT6W2",
  appName: "Skilluse CLI",
};
```

Environment variable overrides (for development/testing with different apps):
- `SKILLUSE_GITHUB_APP_ID`
- `SKILLUSE_GITHUB_CLIENT_ID`

### Quick Reference: Settings Summary

```
GitHub App name:           Skilluse CLI
Homepage URL:              https://skilluse.dev
Callback URL:              http://localhost
Expire user tokens:        [ ] No
Request OAuth on install:  [ ] No
Enable Device Flow:        [x] Yes  <-- CRITICAL
Webhook Active:            [ ] No
Repository Contents:       Read
Repository Metadata:       Read
Installation target:       Any account
```

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

None (first task)

## Out of Scope

- Private key generation (not needed for device flow)
- Webhook configuration
- Logo/branding upload
