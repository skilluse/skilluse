# Remove Keytar - Simplify Credential Storage

## Background

Currently, the CLI uses `keytar` for credential storage, which:
- Requires native compilation (prebuild binaries)
- Needs `libsecret-1-dev` on Linux CI/servers
- Adds complexity to the build and deployment process
- Causes CI failures when system dependencies are missing

## Industry Standard

Major CLIs use **plain text files with permission protection**:

| CLI | Storage | Encryption |
|-----|---------|------------|
| GitHub CLI (`gh`) | `~/.config/gh/hosts.yml` | None |
| AWS CLI | `~/.aws/credentials` | None |
| npm | `~/.npmrc` | None |
| Docker | `~/.docker/config.json` | Base64 only |
| Bun | `~/.bunfig.toml` | None |

These CLIs are trusted by millions of developers and rely solely on:
- File permissions (`0600` - owner read/write only)
- User's responsibility to protect their home directory

## Proposed Solution

Replace `keytar` with simple JSON file storage:

```typescript
// Storage location (following XDG spec)
// Linux: ~/.config/skilluse/auth.json
// macOS: ~/Library/Application Support/skilluse/auth.json
// Windows: %APPDATA%/skilluse/auth.json

interface AuthConfig {
  token: string
  userName: string
}

// Write with restricted permissions
await writeFile(authPath, JSON.stringify(auth, null, 2), { mode: 0o600 })
```

## Benefits

1. **No native dependencies** - Pure JavaScript, no compilation
2. **CI-friendly** - No libsecret installation needed
3. **Debuggable** - Users can inspect/edit auth file directly
4. **Consistent** - Same approach as gh, aws, npm
5. **Simpler codebase** - Remove ~100 lines of keytar/encryption code

## Security Considerations

- File permissions (`0600`) prevent other users from reading
- Token is short-lived OAuth token, not a password
- Users can revoke tokens from GitHub at any time
- Same security model as GitHub CLI (battle-tested)

## Migration

1. Check for existing keytar credentials
2. Migrate to new file format
3. Clear keytar storage
4. Remove keytar dependency

## Files to Modify

- `packages/cli/src/services/credentials.ts` - Simplify to file-only storage
- `packages/cli/package.json` - Remove keytar dependency
- `.github/workflows/ci.yml` - Remove libsecret installation
- `.github/workflows/release.yml` - Remove libsecret if present

## Acceptance Criteria

See features.json for testable criteria.
