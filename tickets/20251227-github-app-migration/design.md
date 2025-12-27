# GitHub App Migration - Design Document

## Overview

Migrate Skilluse CLI authentication from OAuth App to GitHub App to support fine-grained repository permissions. This allows users to grant access to specific repositories instead of all repositories.

## Current State

- Using OAuth App with Device Flow
- Scopes: `repo,user` (all repositories access)
- Client ID hardcoded in `login.tsx`
- Token stored via keychain or encrypted file

## Target State

- GitHub App with Device Flow
- User selects specific repositories during installation
- Installation Access Tokens for repo operations
- User Access Tokens for user identity

## Why GitHub App?

| Feature | OAuth App | GitHub App |
|---------|-----------|------------|
| Repository selection | All or nothing | Per-repository |
| Permissions | Coarse-grained | Fine-grained |
| Token types | User token only | User + Installation tokens |
| Rate limits | User-based | Higher limits for installations |

## Architecture

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CLI Login  │────>│ Device Flow │────>│ User Token  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               v
                          ┌─────────────────────────────────┐
                          │ Check App Installation Status   │
                          └─────────────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    v                                     v
          ┌─────────────────┐                 ┌─────────────────┐
          │ Not Installed   │                 │ Already Install │
          │ Prompt Install  │                 │ Get Install ID  │
          └─────────────────┘                 └─────────────────┘
                    │                                     │
                    v                                     v
          ┌─────────────────┐                 ┌─────────────────┐
          │ User Installs   │                 │ Get Install     │
          │ Selects Repos   │                 │ Access Token    │
          └─────────────────┘                 └─────────────────┘
```

### Token Types

1. **User Access Token**: Identifies the user, used for user-level API calls
2. **Installation Access Token**: Short-lived (1 hour), used for repository operations

### Storage Structure

```typescript
interface StoredCredentials {
  // User authentication
  userToken: string;
  userName: string;

  // Installation info (may have multiple)
  installations: {
    id: number;
    account: string; // user or org name
    repositorySelection: 'all' | 'selected';
  }[];

  // Cached installation token (short-lived)
  installationToken?: {
    token: string;
    expiresAt: string;
    installationId: number;
  };
}
```

## GitHub App Configuration

### Required Settings

- **App Name**: Skilluse CLI
- **Homepage URL**: https://skilluse.dev
- **Callback URL**: http://localhost (for device flow)
- **Setup URL**: (optional) Post-installation redirect
- **Webhook**: Disabled (not needed for CLI)

### Required Permissions

| Permission | Access | Reason |
|------------|--------|--------|
| Contents | Read | Read skill files from repos |
| Metadata | Read | List repositories |

### Device Flow

Enable "Device Flow" in GitHub App settings to support CLI authentication without browser redirect.

## API Endpoints

### GitHub App APIs

| Endpoint | Purpose |
|----------|---------|
| `POST /login/device/code` | Start device flow |
| `POST /login/oauth/access_token` | Exchange code for user token |
| `GET /user/installations` | List user's installations |
| `GET /user/installations/{id}/repositories` | List repos for installation |
| `POST /app/installations/{id}/access_tokens` | Get installation token |

## Migration Strategy

### Phase 1: Create GitHub App
- Register new GitHub App
- Configure permissions and settings
- Obtain App ID and Client ID

### Phase 2: Update OAuth Service
- Support GitHub App device flow
- Handle user token vs installation token
- Implement installation token refresh

### Phase 3: Update Credential Storage
- Store installation information
- Cache installation tokens with expiry
- Handle multiple installations (personal + orgs)

### Phase 4: Update CLI Commands
- Login: Add installation flow
- Logout: Clear all tokens
- Whoami: Show installation status
- New: `skilluse repos` to manage repo access

### Phase 5: Cleanup
- Remove old OAuth App code
- Update documentation
- Delete old OAuth App from GitHub

## Security Considerations

1. **Installation tokens expire**: Must refresh before use
2. **Private key not needed**: Device flow doesn't require app private key
3. **Minimal permissions**: Only request necessary scopes
4. **Token validation**: Verify tokens before operations

## Out of Scope

- Webhook handling (not needed for CLI)
- GitHub App Manifest flow (manual setup is fine)
- Organization-wide installation management

## References

- [GitHub Apps Documentation](https://docs.github.com/en/apps/creating-github-apps)
- [Device Flow for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app#using-the-device-flow-to-generate-a-user-access-token)
- [Installation Access Tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)
