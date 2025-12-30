# Configuration Migration

## Overview

Provide automatic migration from the legacy `~/.skilluse/config.json` to the new platform-native paths and secure credential storage. Ensure zero data loss and smooth user experience.

## Requirements

- Detect existing legacy configuration at `~/.skilluse/config.json`
- Migrate general config (repos, installed skills) to new platform-native location
- Migrate auth tokens to secure keychain storage
- Clean up legacy files after successful migration
- Show user-friendly migration messages

## Technical Details

### Migration Flow

```
1. On startup, check for legacy config at ~/.skilluse/config.json
2. If exists and new config does NOT exist:
   a. Read legacy config
   b. Migrate repos + installed to new config location
   c. Migrate auth to keychain (or encrypted fallback)
   d. Create migration marker file
   e. Log success message
3. If both exist, skip migration (already done)
4. Optionally: remove ~/.skilluse/ after N days with user confirmation
```

### Migration Service

```typescript
// packages/cli/src/services/migration.ts

export interface MigrationResult {
  migrated: boolean;
  configMigrated: boolean;
  authMigrated: boolean;
  errors: string[];
}

export async function checkNeedsMigration(): Promise<boolean>;
export async function runMigration(): Promise<MigrationResult>;
export async function cleanupLegacyConfig(): Promise<void>;
```

### Legacy Path Detection

```typescript
const legacyPath = join(homedir(), '.skilluse', 'config.json');
const legacyExists = existsSync(legacyPath);
```

### Files to Modify

- `packages/cli/src/services/migration.ts` - new migration service
- `packages/cli/src/services/store.ts` - call migration on init
- `packages/cli/src/services/index.ts` - export migration service

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- cfg01-platform-paths
- cfg02-secure-credentials

## Out of Scope

- Migration from other CLI tools
- Automatic cleanup without user confirmation
