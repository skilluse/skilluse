# Add Status Command as Default Action

## Overview

Make `skilluse` (no arguments) display a structured status overview instead of help. This follows modern CLI design patterns (vercel, fly, railway) where the zero-arg UX shows useful status information.

## Background

Currently, running `skilluse` without arguments shows Commander.js help. The `commands/index.tsx` already has a status implementation, but it's not wired up in `cli.tsx` and the output format could be improved.

## Requirements

- `skilluse` (no args) shows status overview
- Remove explicit `skilluse status` command (keep CLI minimal)
- Display structured, grouped information
- No "Quick Actions" section (keep it concise)

## Output Format

```
Authentication
  ✓ Logged in as @username

Agent
  ● Claude (claude)

Repos (2)
  ● anthropics/claude-skills  [main] skills/  (default)
  ○ my/personal-skills        [main] (all)

Installed Skills (3)
  commit       from anthropics/claude-skills
  pdf          from anthropics/claude-skills
  code-review  from my/personal-skills
```

### Not Logged In State

```
Authentication
  ○ Not logged in (run 'skilluse login')

Agent
  ● Claude (claude)

Repos (0)
  (no repositories configured)

Installed Skills (0)
  (no skills installed)
```

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/cli.tsx` | Add default action to render Index component |
| `src/commands/index.tsx` | Update output format to match design |

### Implementation

1. In `cli.tsx`, add before `program.parse()`:
   ```tsx
   program.action(() => {
     render(<Index options={{}} />);
   });
   ```

2. Update `commands/index.tsx` to:
   - Remove "Quick Actions" section
   - Show full repo list (not just count)
   - Show full skill list (not just count)
   - Use structured grouping with headers

## Acceptance Criteria

See `feature.json` for testable criteria.

## Dependencies

- refactor03-remove-version-field (should not show version in skill list)

## Out of Scope

- `--json` output flag (can be added later)
- Separate `skilluse status` command
