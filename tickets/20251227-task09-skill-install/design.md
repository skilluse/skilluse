# Skill Installation

## Overview
Implement skill installation, uninstallation, listing, upgrade, and info commands.

## Requirements
- `skilluse install <skill-name>` - Install skill locally
- `skilluse install <skill-name> --global` - Install globally
- `skilluse uninstall <skill-name>` - Remove installed skill
- `skilluse list` - List installed skills
- `skilluse list --outdated` - Show skills with updates
- `skilluse upgrade [skill-name]` - Upgrade skill(s)
- `skilluse info <skill-name>` - Show skill details

## Technical Details

### Install Locations
| Scope | Path |
|-------|------|
| Local | `./.claude/skills/<name>/` |
| Global | `~/.claude/skills/<name>/` |

### Install Process
1. Resolve skill location (handle conflicts)
2. Download skill files from GitHub
3. Write to target directory
4. Record in config with commit SHA

### Progress UI
```
┌─────────────────────────────────────────────────────┐
│  Installing: code-review (local)                    │
├─────────────────────────────────────────────────────┤
│  ✔ Fetching skill metadata                         │
│  ✔ Downloading files (3/3)                         │
│  ◐ Installing to ./.claude/skills/code-review      │
│  ○ Verifying installation                          │
│                                                     │
│  ████████████░░░░░░░░  60%                         │
└─────────────────────────────────────────────────────┘
```

### Conflict Resolution
When skill exists in multiple repos:
```
⚠ "code-review" found in multiple repos:

❯ anthropics/skills      v1.2.0  (default repo)
  company/internal       v2.0.1

Use: skilluse install owner/repo/skill-name
```

### Version Tracking
- Store commit SHA when installing
- Compare with remote HEAD for outdated check
- Display version from SKILL.md if available

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task05-config-store
- [x] task07-repo-commands
- [x] task08-skill-search

## Out of Scope
- Skill execution
- Dependency management between skills

## CLI Cleanup (Session 2)
During implementation review, the following redundant commands were removed:
- `repos` - Confused with `repo`, removed
- `whoami` - Info shown in root `skilluse` command
- `skills` - Alias for `list`, removed to simplify
- `demo` - Development only, removed
- `repo sync` - Unnecessary, data fetched on demand

Added Biome for code formatting and linting.
