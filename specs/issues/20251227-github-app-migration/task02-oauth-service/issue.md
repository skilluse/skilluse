# Task 02: GitHub App OAuth Service

## Overview

Update the OAuth service to support GitHub App authentication flow. This includes device flow for user tokens and installation token management.

## Requirements

- Implement GitHub App device flow (similar to OAuth App but with different endpoints)
- Add installation token fetching
- Handle token refresh for expired installation tokens
- Support listing user installations and repositories

## Technical Details

### New Service: `github-app.ts`

```typescript
// Core functions needed:

// 1. Device flow (user authentication)
requestDeviceCode(clientId: string): Promise<DeviceCodeResponse>
pollForUserToken(clientId: string, deviceCode: string): Promise<UserTokenResponse>

// 2. Installation management
getUserInstallations(userToken: string): Promise<Installation[]>
getInstallationRepositories(userToken: string, installationId: number): Promise<Repository[]>

// 3. Installation token
getInstallationToken(userToken: string, installationId: number): Promise<InstallationToken>
```

### API Endpoints

| Function | Endpoint | Auth |
|----------|----------|------|
| Device code | `POST /login/device/code` | None |
| User token | `POST /login/oauth/access_token` | None |
| List installations | `GET /user/installations` | User token |
| List repos | `GET /user/installations/{id}/repositories` | User token |
| Installation token | `POST /user/installations/{id}/access_tokens` | User token |

### Type Definitions

```typescript
interface Installation {
  id: number;
  account: {
    login: string;
    type: 'User' | 'Organization';
  };
  repository_selection: 'all' | 'selected';
  permissions: Record<string, string>;
}

interface InstallationToken {
  token: string;
  expires_at: string;
  permissions: Record<string, string>;
  repositories?: Repository[];
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}
```

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- task01-create-github-app (need App ID and Client ID)

## Out of Scope

- JWT authentication (not needed, using user token flow)
- Webhook signature verification
