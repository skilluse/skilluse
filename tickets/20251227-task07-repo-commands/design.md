# Repo Management Commands

## Overview
Implement CLI commands for managing skill source repositories.

## Requirements
- `skilluse repo add <owner/repo>` - Add repo with path selection
- `skilluse repo edit <owner/repo>` - Modify repo path configuration
- `skilluse repo remove <owner/repo>` - Remove repo
- `skilluse repo list` - List configured repos
- `skilluse repo use <owner/repo>` - Set default repo
- `skilluse repo sync [owner/repo]` - Refresh skill index

## Technical Details

### Command Options
```bash
skilluse repo add <owner/repo> [options]
  --path <path>         Specify skill paths (can repeat)
  --branch <branch>     Specify branch (default: main)
  --no-interactive      Skip interactive mode

skilluse repo edit <owner/repo>
  # Re-enters interactive path selection

skilluse repo remove <owner/repo>
  --force               Skip confirmation

skilluse repo list
  # Shows table with repo, paths, skill count, default marker

skilluse repo use <owner/repo>
  # Sets default repo for install without repo prefix

skilluse repo sync [owner/repo]
  # Refreshes index, or all repos if no arg
```

### List UI
```
┌─────────────────────────────────────────────────────┐
│  Configured Repos                                   │
├─────────────────────────────────────────────────────┤
│  ● anthropics/claude-skills    skills/    (default)│
│  ○ company/internal-skills     prompts/            │
│  ○ my/personal-skills          (all)               │
└─────────────────────────────────────────────────────┘
```

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task04-auth-commands
- [x] task05-config-store
- [x] task06-repo-discovery

## Out of Scope
- Skill installation (task09)
- Private repo validation
