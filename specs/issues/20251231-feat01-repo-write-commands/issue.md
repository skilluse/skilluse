# Add Repo Init and Publish Commands

## Overview

Add write capabilities to the CLI, enabling users to create skill repositories and publish skills. Currently the CLI is read-only (search, install, list). These commands complete the skill ecosystem by allowing users to be both consumers and creators.

## Requirements

- `skilluse repo init <username/repo>` - Create a new skills repository on GitHub
- `skilluse publish [skill-path]` - Publish a local skill to a configured repository
- Proper validation of skill structure before publishing
- GitHub API integration for repo creation and file commits

## Technical Details

### Command: `repo init <username/repo>`

Creates a new GitHub repository with proper skills structure.

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| `username/repo` | Yes | Repository name in owner/repo format |

**Options:**
| Option | Default | Description |
|--------|---------|-------------|
| `--public` | Yes | Create as public repository |
| `--private` | No | Create as private repository |
| `--path <path>` | `skills` | Skills directory within repo |

**Generated Structure:**
```
my-skills/
├── README.md           # Auto-generated repo description
└── skills/             # Default skills directory
    └── .gitkeep
```

**API Calls:**
- `POST /user/repos` - Create repository
- `PUT /repos/{owner}/{repo}/contents/{path}` - Create initial files

---

### Command: `publish [skill-path]`

Publishes a local skill directory to a configured repository.

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| `skill-path` | No | Path to skill directory (default: current dir) |

**Options:**
| Option | Default | Description |
|--------|---------|-------------|
| `-r, --repo <name>` | default repo | Target repository (owner/repo) |
| `--pr` | No | Create PR instead of direct push |

**Workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Validate Skill                                           │
│    → Check SKILL.md exists                                  │
│    → Parse frontmatter (name, description)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Check Target Repository                                  │
│    → Verify repo exists and user has write access           │
│    → Check for existing skill with same name                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Upload Files                                             │
│    → PUT /repos/{owner}/{repo}/contents/{path}             │
│    → Commit all skill files to main branch (or PR)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Complete                                                 │
│    ✔ Published {skill-name} to {repo}                      │
│    → https://github.com/{owner}/{repo}/tree/main/skills/.. │
└─────────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- SKILL.md must exist
- SKILL.md must have valid YAML frontmatter with: name, description

**API Calls:**
- `GET /repos/{owner}/{repo}/contents/{path}` - Check existing skill
- `PUT /repos/{owner}/{repo}/contents/{path}` - Create/update files
- `POST /repos/{owner}/{repo}/pulls` - Create PR (if --pr flag)

---

### Data Models

```typescript
interface RepoInitOptions {
  public: boolean;
  private: boolean;
  path: string;
}

interface PublishOptions {
  repo?: string;
  pr: boolean;
}
```

---

### Dependencies

- GitHub API with `repo` scope (may require re-authentication)
- Existing services: oauth.ts, github.ts, store.ts, metadata.ts

### New Files

```
packages/cli/src/
├── commands/
│   ├── repo/
│   │   └── init.tsx      # New: repo init command
│   └── publish.tsx       # New: publish command
```

## Acceptance Criteria

See `feature.json` for testable criteria.

## Issue Dependencies

- None (all core CLI features completed)

## Out of Scope

- Version management (Git Tags, GitHub Releases)
- Automatic version bumping
- Skill registry/index file management
- Team/organization permission management
