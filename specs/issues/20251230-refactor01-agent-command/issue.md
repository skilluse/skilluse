# Refactor: Simplify "agent use" to "agent"

## Overview

Simplify the CLI command structure by changing `skilluse agent use <agent-id>` to `skilluse agent <agent-id>`. This reduces verbosity while maintaining clarity.

## Background

Current command: `skilluse agent use claude` (3 words)
Proposed command: `skilluse agent claude` (2 words)

The word "use" is redundant because:
- SkillUse provides skills **for** agents, not "uses" agents
- The `agent` subcommand's primary purpose is to set the target agent
- Follows CLI conventions where the subcommand implies the action

## Requirements

- [ ] Merge `agent/use.tsx` functionality into `agent/index.tsx`
- [ ] Accept optional `<agent-id>` argument in `agent` command
- [ ] When `<agent-id>` provided: switch to that agent
- [ ] When no argument: show list of supported agents (current behavior)
- [ ] Update help text to reflect new usage
- [ ] Remove `agent/use.tsx` file
- [ ] Update `cli.tsx` to remove `agent use` subcommand

## Technical Details

### Current Structure
```
src/commands/agent/
├── index.tsx      # Lists agents when `skilluse agent` is called
└── use.tsx        # Switches agent when `skilluse agent use <id>` is called
```

### Proposed Structure
```
src/commands/agent/
└── index.tsx      # Combined: list agents OR switch agent
```

### Command Behavior

```bash
# No argument - interactive selection (enhanced)
skilluse agent
# Output: Interactive selection with arrow keys
# Select an agent:
#   Claude Code (current)
#   Cursor
#   Windsurf
#   ...

# With argument - switch agent directly
skilluse agent claude
# Output: "Switched to Claude"

# Help
skilluse agent --help
# Usage: skilluse agent [agent-id]
```

### Code Changes

1. **agent/index.tsx**: Add optional argument handling
   - Accept `z.tuple([z.string().optional()])`
   - If argument provided, call switch logic
   - If no argument, show agent list

2. **cli.tsx**: Remove `agent use` subcommand registration

3. **Delete**: `agent/use.tsx`

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- Adding new agents
- Changing agent configuration format
- Auto-detection of agent from current directory
