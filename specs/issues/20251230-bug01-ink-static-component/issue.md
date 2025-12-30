# Fix Ink Exit Race Condition Using Static Component

## Overview

Fix the race condition where CLI output disappears when `exit()` is called immediately after `setState()`. Use Ink's official `<Static>` component pattern for preserving CLI output after exit.

## Problem

Ink (React for CLI) clears dynamic output when `exit()` is called. Many commands call `exit()` directly after `setState()`, causing the final output to be cleared before it's displayed.

### Symptom

```bash
$ skilluse list
⠋ Loading...
$                    # <- Output disappeared!
```

### Root Cause

```tsx
// ❌ BAD: exit() called immediately after setState()
setState({ phase: "success", data });
exit();  // Clears screen before React renders
```

## Solution

Use Ink's `<Static>` component which is designed for content that should persist after exit.

### Correct Pattern (Reference: repo/list.tsx)

```tsx
import { Box, Static, Text, useApp } from "ink";

export default function Command() {
  const { exit } = useApp();
  const [state, setState] = useState({ phase: "checking" });
  const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

  // Load data
  useEffect(() => {
    async function load() {
      const data = await fetchData();
      setState({ phase: "success", data });
      // NOTE: Don't call exit() here!
    }
    load();
  }, []);

  // Add output item when data is ready
  useEffect(() => {
    if (state.phase === "success" && outputItems.length === 0) {
      setOutputItems([{ id: "output" }]);
    }
  }, [state.phase, outputItems.length]);

  // Exit after output item is rendered
  useEffect(() => {
    if (outputItems.length > 0) {
      process.nextTick(() => exit());
    }
  }, [outputItems.length, exit]);

  return (
    <>
      {state.phase === "checking" && <Spinner text="Loading..." />}
      <Static items={outputItems}>
        {(item) => (
          <Box key={item.id} flexDirection="column">
            {renderContent()}
          </Box>
        )}
      </Static>
    </>
  );
}
```

## Commands Status

### Already Fixed (use `<Static>` pattern)

| File | Command | Status |
|------|---------|--------|
| `repo/list.tsx` | `repo list` | ✅ Fixed |
| `repo/index.tsx` | `repo` | ✅ Fixed |
| `repo/use.tsx` | `repo use` | ✅ Fixed |
| `agent/index.tsx` | `agent` | ✅ Fixed |
| `agent/use.tsx` | `agent use` | ✅ Fixed |
| `logout.tsx` | `logout` | ✅ Fixed |
| `list.tsx` | `list` | ✅ Fixed (v0.2.1) |

### Need to Fix (call `exit()` directly)

| File | Command | Priority |
|------|---------|----------|
| `repo/remove.tsx` | `repo remove` | High - shows only "Checking..." |
| `repo/edit.tsx` | `repo edit` | High - shows only "Checking..." |
| `search.tsx` | `search` | High - common command |
| `info.tsx` | `info` | High - common command |
| `install.tsx` | `install` | Medium - has multi-step UI |
| `upgrade.tsx` | `upgrade` | Medium - has progress UI |
| `uninstall.tsx` | `uninstall` | Medium - has confirmation |
| `index.tsx` | status (no args) | Low - shows help instead |
| `repo/add.tsx` | `repo add` | Low - has interactive selection |
| `login.tsx` | `login` | Low - has interactive OAuth flow |

## Requirements

1. For each command in "Need to Fix" list:
   - Import `Static` from ink
   - Add `outputItems` state
   - Add useEffect to populate outputItems when state is final
   - Add useEffect to call `process.nextTick(() => exit())` when outputItems changes
   - Wrap final output in `<Static items={outputItems}>`
   - Remove direct `exit()` calls after `setState()`

2. Test each fixed command:
   - Run command
   - Verify output is displayed correctly
   - Verify output persists in terminal history after exit

## Technical Notes

### Static Component Behavior

- Content in `<Static>` is rendered once and preserved in terminal history
- Works with arrays of items via `items` prop
- Each item needs a unique key
- Content is rendered above dynamic content (spinner)

### Key Points

- Use `process.nextTick(() => exit())` to ensure Static has completed rendering
- The `outputItems` array triggers Static to render
- Spinner shows while `outputItems.length === 0`
- Final output shows when `outputItems.length > 0`

### Interactive Commands (login, repo add)

For commands with interactive elements (user input, selection):
- Only apply the pattern to final output states
- Keep interactive states as regular dynamic content
- Apply `<Static>` when transitioning to success/error states

## Acceptance Criteria

See `feature.json` for testable criteria.

## References

- Reference implementation: `src/commands/repo/list.tsx`
- Reference implementation: `src/commands/list.tsx` (fixed in v0.2.1)
- [Ink GitHub - Static component](https://github.com/vadimdemedes/ink)
