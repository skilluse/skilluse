# Verify Filesystem and CWD in List Command

## Overview

The `skilluse list` command has two issues:

1. **Local skills show across all projects** - Config is global but local `installedPath` is project-specific
2. **Deleted skills still appear** - No filesystem verification for stale entries

## Problem 1: Local Skills Not Scoped to CWD

The config file is stored globally (`~/Library/Application Support/skilluse/config.json`), but local skills have project-specific paths.

**Scenario:**
1. In Project A: `skilluse install pdf` → config stores `/projectA/.claude/skills/pdf`
2. In Project B: `skilluse list` → shows "pdf" but path points to Project A
3. Project B doesn't actually have this skill installed

**Current behavior:**
```typescript
// list.tsx - only filters by agent, NOT by current directory
const skills = config.installed.filter(s => s.agent === currentAgent);
```

**Expected behavior:**
- Local skills should only appear when running `skilluse list` in the same project
- Global skills should always appear

## Problem 2: Deleted Skills Still Appear

When a user manually deletes a skill folder, the config isn't updated.

## Requirements

1. Filter local skills by current working directory
2. Filter out skills whose `installedPath` no longer exists
3. Optionally: Auto-cleanup stale entries from config

## Technical Details

### Affected Files
| File | Change |
|------|--------|
| `packages/cli/src/commands/list.tsx` | Add CWD and filesystem filtering |
| `packages/cli/src/services/store.ts` | (Optional) Add cleanup function |

### Implementation Approach

```typescript
import { existsSync } from "node:fs";

// In loadSkills():
const config = getConfig();
const cwd = process.cwd();

const skills = config.installed.filter(skill => {
  // 1. Filter by agent
  if (skill.agent !== currentAgent && skill.agent) return false;

  // 2. Local skills: only show if in current directory
  if (skill.scope === "local" && !skill.installedPath.startsWith(cwd)) {
    return false;
  }

  // 3. Verify file exists
  if (!existsSync(skill.installedPath)) {
    return false;
  }

  return true;
});
```

### Performance Consideration

`existsSync` is synchronous but very fast for checking file existence. For a typical user with <50 skills, this adds negligible overhead (<10ms).

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- Watching filesystem for changes (real-time sync)
- Recovering deleted skills from backup
