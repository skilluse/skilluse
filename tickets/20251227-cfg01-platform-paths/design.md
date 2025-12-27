# Platform-Native Configuration Paths

## Overview

Replace the hardcoded `~/.skilluse/` configuration directory with platform-native paths using the `env-paths` library. This provides a more standard user experience across operating systems.

## Requirements

- Install and integrate `env-paths` package
- Replace hardcoded `~/.skilluse/` with platform-appropriate paths
- Separate config, data, and cache directories per XDG/platform conventions
- Maintain the same configuration file structure internally

## Technical Details

### Target Directory Structure

```
macOS:
  config: ~/Library/Preferences/skilluse/
  data:   ~/Library/Application Support/skilluse/
  cache:  ~/Library/Caches/skilluse/

Linux:
  config: ~/.config/skilluse/
  data:   ~/.local/share/skilluse/
  cache:  ~/.cache/skilluse/

Windows:
  config: %APPDATA%/skilluse/Config/
  data:   %APPDATA%/skilluse/Data/
  cache:  %LOCALAPPDATA%/skilluse/Cache/
```

### Implementation

```typescript
import envPaths from 'env-paths';

const paths = envPaths('skilluse', { suffix: '' });

// paths.config - user preferences/settings
// paths.data   - application data (installed skills)
// paths.cache  - cached data
```

### Files to Modify

- `packages/cli/package.json` - add env-paths dependency
- `packages/cli/src/services/store.ts` - use env-paths for directory resolution
- `packages/cli/src/services/paths.ts` - new file exporting path constants

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

None - this is a foundational ticket.

## Out of Scope

- Migration from old ~/.skilluse/ path (see cfg03-config-migration)
- Credential storage changes (see cfg02-secure-credentials)
