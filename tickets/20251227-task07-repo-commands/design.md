# Repo Commands & CLI Polish

## Overview
Implement repo management commands and improve CLI UX with status overview and aliases.

## Commands

### Status Overview
```bash
skilluse                        # Show status overview (user, repo, skills)
```

### Repo Management
```bash
skilluse repo                   # Show current/default repo
skilluse repo add <owner/repo>  # Add repo with path selection
skilluse repo edit <owner/repo> # Modify repo path configuration
skilluse repo remove <owner/repo> # Remove repo
skilluse repo list              # List configured repos
skilluse repo use <owner/repo>  # Set default repo
skilluse repo sync [owner/repo] # Update skill index
```

### Aliases
```bash
skilluse repos                  # = repo list
skilluse skills                 # = list (installed skills)
```

## Technical Details

### Status Overview UI
```
skilluse v0.1.0

  User:    @username
  Repo:    anthropics/skills (default)
  Skills:  3 installed

Quick start:
  skilluse search <query>    Search for skills
  skilluse install <skill>   Install a skill
  skilluse repos             List repositories
```

### Not Logged In State
```
skilluse v0.1.0

  Not logged in

Run `skilluse login` to get started.
```

### Repo List UI
```
Configured Repositories

  ● anthropics/claude-skills    skills/       (default)
  ○ company/internal-skills     prompts/
  ○ my/personal-skills          (all paths)
```

### Command Options
```bash
skilluse repo add <owner/repo> [options]
  --path <path>         Specify skill paths (can repeat)
  --branch <branch>     Specify branch (default: main)
  --no-interactive      Skip interactive mode

skilluse repo remove <owner/repo>
  --force               Skip confirmation

skilluse repo sync [owner/repo]
  # Syncs specified repo, or all repos if no arg
```

## Implementation Order

1. `skilluse` status overview (logged in + not logged in)
2. `skilluse repo` (no subcommand = show current)
3. `skilluse repo list`
4. `skilluse repo add` (with path selection)
5. `skilluse repo remove`
6. `skilluse repo use`
7. `skilluse repo sync`
8. `skilluse repo edit`
9. Aliases: `repos`, `skills`

## Acceptance Criteria
See `features.json` for testable criteria.

## Dependencies
- [x] task04-auth-commands
- [x] task05-config-store
- [x] task06-repo-discovery

## Out of Scope
- `--json` output (not needed for interactive CLI)
- `-q` quiet mode (OAuth requires browser)
- Global `--repo` flag
- Skill installation (task09)
