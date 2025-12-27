# Task 03: Update Credential Storage

## Overview

Update the credential storage service to handle GitHub App's multiple token types: user access tokens and installation access tokens.

## Requirements

- Store user access token (long-lived)
- Store installation information (which installations user has access to)
- Cache installation tokens with expiry tracking
- Handle token refresh when installation token expires

## Technical Details

### Updated Credentials Interface

```typescript
interface StoredCredentials {
  // User authentication (from device flow)
  userToken: string;
  userName: string;

  // Installation info
  installations: Installation[];

  // Default installation for operations
  defaultInstallationId?: number;
}

interface Installation {
  id: number;
  account: string;
  accountType: 'User' | 'Organization';
  repositorySelection: 'all' | 'selected';
}

// Separate cache for short-lived installation tokens
interface InstallationTokenCache {
  installationId: number;
  token: string;
  expiresAt: Date;
}
```

### Storage Strategy

| Data | Storage | Reason |
|------|---------|--------|
| User token | Keychain/encrypted file | Long-lived, sensitive |
| Installation list | Config file (JSON) | Metadata, not secret |
| Installation token | Memory cache | Short-lived (1 hour) |

### New Functions

```typescript
// Credential management
setUserCredentials(token: string, userName: string): Promise<void>
getUserCredentials(): Promise<{token: string, userName: string} | null>

// Installation management
setInstallations(installations: Installation[]): Promise<void>
getInstallations(): Promise<Installation[]>
setDefaultInstallation(installationId: number): Promise<void>
getDefaultInstallation(): Promise<number | null>

// Installation token cache
getCachedInstallationToken(installationId: number): InstallationTokenCache | null
setCachedInstallationToken(cache: InstallationTokenCache): void
clearInstallationTokenCache(): void

// Combined clear
clearAllCredentials(): Promise<void>
```

### Migration

- Detect old credential format (token + user only)
- Prompt user to re-authenticate with new flow
- Clear old credentials after migration

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- task01-create-github-app (for new auth flow context)

## Out of Scope

- Automatic migration of old tokens (require re-auth)
- Multi-account support (one user at a time)
