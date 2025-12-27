# Secure Credential Storage

## Overview

Move OAuth tokens from plain JSON file storage to system keychain/credential manager for improved security. Provide encrypted file fallback for systems without keychain support.

## Requirements

- Store GitHub OAuth tokens in system keychain (macOS Keychain, Windows Credential Manager, Linux libsecret)
- Provide encrypted file fallback when keychain unavailable
- Separate credential operations from general config operations
- Maintain backwards compatibility during migration period

## Technical Details

### Keychain Storage

Using `keytar` (or `@aspect-build/keytar` for better ESM support):

```typescript
import keytar from 'keytar';

const SERVICE_NAME = 'skilluse';

// Store token
await keytar.setPassword(SERVICE_NAME, 'github-token', token);
await keytar.setPassword(SERVICE_NAME, 'github-user', username);

// Retrieve token
const token = await keytar.getPassword(SERVICE_NAME, 'github-token');

// Delete token
await keytar.deletePassword(SERVICE_NAME, 'github-token');
```

### Fallback: Encrypted File Storage

When keychain is unavailable, use encrypted JSON file:

```typescript
// Use machine-specific key derivation
// Store in: {dataPath}/credentials.enc

import crypto from 'crypto';

// Derive key from machine ID + user
const key = deriveKey(machineId, os.userInfo().username);
const encrypted = encrypt(JSON.stringify(credentials), key);
```

### New Credentials Service API

```typescript
// packages/cli/src/services/credentials.ts

export interface Credentials {
  token: string;
  user: string;
}

export async function getCredentials(): Promise<Credentials | null>;
export async function setCredentials(token: string, user: string): Promise<void>;
export async function clearCredentials(): Promise<void>;
export async function isKeychainAvailable(): Promise<boolean>;
```

### Files to Modify

- `packages/cli/package.json` - add keytar dependency
- `packages/cli/src/services/credentials.ts` - new credentials service
- `packages/cli/src/services/store.ts` - remove auth storage, use credentials service
- `packages/cli/src/services/index.ts` - export credentials service

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- cfg01-platform-paths (for dataPath fallback location)

## Out of Scope

- Token refresh/rotation logic
- Multiple account support
