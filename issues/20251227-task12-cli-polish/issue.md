# CLI Polish - Error Handling & Onboarding

## Overview
Improve CLI "edge experience" with better error messages, first-run onboarding, and help text hierarchy.

## Requirements

### 1. Structured Error Messages
Replace generic errors with actionable messages:

```bash
# Before
Error: Repository not found

# After
✗ Repository 'foo/bar' not found

  Possible causes:
  • The repository doesn't exist
  • You don't have access (try: skilluse login)

  Run 'skilluse repo list' to see available repos
```

### 2. First-Run Onboarding
Detect first run and show guided setup:

```bash
$ skilluse
Welcome to skilluse! 👋

Let's get you set up:

  1. skilluse login      Connect to GitHub
  2. skilluse repo add   Add a skill repository
  3. skilluse search     Find skills to install

Run 'skilluse login' to get started.
```

### 3. Help Text Hierarchy
Provide layered help at each command level:

```bash
skilluse --help           # Overview of all commands
skilluse repo --help      # Repo subcommands
skilluse repo add --help  # Specific options for 'add'
```

### 4. Dangerous Operation Confirmation
Prompt before destructive actions:

```bash
$ skilluse repo remove anthropics/skills
This will remove 'anthropics/skills' and untrack 5 installed skills.
Continue? [y/N]
```

### 5. Update Notification
Show when newer version available:

```bash
$ skilluse
skilluse v0.1.0 (update available: v0.2.0 - run 'npm update -g skilluse')

  User:    @username
  ...
```

## Technical Details

### Error Message Format
```typescript
interface CLIError {
  symbol: '✗' | '⚠';
  message: string;
  causes?: string[];
  suggestion?: string;
}
```

### First-Run Detection
- Check if `~/.skilluse/config.json` exists
- Check if any credentials stored
- Show onboarding only on true first run

### Version Check
- Cache npm registry check (once per day)
- Store last check timestamp in config
- Non-blocking (don't slow down CLI)

## Implementation Order

1. Error message component/utility
2. First-run detection + onboarding UI
3. Help text for all commands
4. Confirmation prompts for remove/uninstall
5. Version check + update notification

## Acceptance Criteria
See `features.json` for testable criteria.

## Dependencies
- [x] task07-repo-commands

## Out of Scope
- Auto-update mechanism
- Telemetry/analytics
