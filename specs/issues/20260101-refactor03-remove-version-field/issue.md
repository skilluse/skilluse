# Remove Version Field from InstalledSkill

## Overview

Remove the `version` field from `InstalledSkill` interface and all related UI code. Version management has been moved to backlog (`specs/backlog/skill-version-management.md`) and should not be part of the current CLI implementation.

## Background

The CLI currently tracks `version` in `InstalledSkill`, but this creates a false impression that version management is supported. The actual version tracking uses `commitSha` only. The `version` field from `SKILL.md` frontmatter should not be stored or displayed until the full version management feature is implemented.

## Requirements

- Remove `version` field from `InstalledSkill` interface in `store.ts`
- Remove version display from `list.tsx` command output
- Remove version parsing/storage from `install.tsx`
- Remove version-related UI in `upgrade.tsx`
- Keep `commitSha` as the sole version tracking mechanism
- Keep `scope` field (local/global) - this is NOT being removed

## Files to Modify

| File | Change |
|------|--------|
| `src/services/store.ts` | Remove `version` from `InstalledSkill` |
| `src/commands/list.tsx` | Remove `v{skill.version}` display |
| `src/commands/install.tsx` | Remove version extraction from SKILL.md |
| `src/commands/upgrade.tsx` | Remove version diff display |

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- Version management feature (in backlog)
- Removing `scope` field (this stays)
- Removing `commitSha` field (this stays)
