# Fix Ink Exit Race Condition Using Static Component

## Overview

Replace the current `setImmediate` workaround with Ink's official `<Static>` component pattern for preserving CLI output after exit.

## Problem

Ink (React for CLI) clears dynamic output when `exit()` is called. The current workaround uses `setImmediate` to defer exit until after React's render cycle, but this is not the standard approach.

### Current Workaround (Non-Standard)

```tsx
// hooks/useExitAfterRender.ts
useEffect(() => {
  if (shouldExit) {
    setImmediate(() => exit());
  }
}, [shouldExit, exit]);
```

### Issues with Current Approach

1. **Relies on implementation details** - `setImmediate` timing is not part of Ink's API
2. **Theoretical race condition** - React batch updates could theoretically span event loops
3. **Not idiomatic** - Ink distinguishes between dynamic content (cleared) and static content (preserved)

## Solution

Use Ink's `<Static>` component which is designed for content that should persist after exit.

### Official Pattern

```tsx
import { Static, Box, Text } from "ink";

function RepoList() {
  const [items, setItems] = useState<RepoItem[]>([]);

  return (
    <Static items={items}>
      {(item) => (
        <Box key={item.repo}>
          <Text>{item.repo}</Text>
        </Box>
      )}
    </Static>
  );
}
```

## Affected Files

Commands currently using `useExitAfterRender` workaround:

| File | Command |
|------|---------|
| `src/commands/repo/list.tsx` | `repo list` |
| `src/commands/repo/index.tsx` | `repo` |
| `src/commands/repo/use.tsx` | `repo use` |
| `src/commands/agent/index.tsx` | `agent` |
| `src/commands/agent/use.tsx` | `agent use` |
| `src/commands/logout.tsx` | `logout` |

## Requirements

- [ ] Study Ink's `<Static>` component API and patterns
- [ ] Refactor affected commands to use `<Static>` for final output
- [ ] Remove `useExitAfterRender` hook after migration
- [ ] Test all affected commands preserve output correctly
- [ ] Verify spinner/loading states still work during async operations

## Technical Details

### Static Component Behavior

- Content in `<Static>` is rendered once and preserved in terminal history
- Works with arrays of items via `items` prop
- Each item needs a unique key
- Content is rendered above dynamic content

### Migration Strategy

For each command:
1. Identify the "final state" that should persist
2. Wrap final state JSX in `<Static>`
3. Remove `useExitAfterRender` hook usage
4. Test output preservation

## Acceptance Criteria

See `feature.json` for testable criteria.

## References

- [Ink GitHub - Static component](https://github.com/vadimdemedes/ink)
- [Ink 3 announcement](https://vadimdemedes.com/posts/ink-3)
- [Issue #476: Exit stdin but persist final output](https://github.com/vadimdemedes/ink/issues/476)
