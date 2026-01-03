# SkillUse CLI Design

## Vision: A Decentralized Skills Registry

SkillUse is the foundation for a **decentralized Skills Registry** that transforms how teams create, share, and execute AI agent expertise—for every knowledge worker.

### Skills = Domain Knowledge + Workflow Automation

A skill empowers AI agents with two complementary capabilities:

| Dimension | What It Provides |
|-----------|-----------------|
| **Domain Knowledge** | Expert reasoning, best practices, decision frameworks, quality standards |
| **Workflow Automation** | Executable SOPs that orchestrate agent tools into multi-step pipelines |

This dual nature is what makes skills powerful. They encode *how experts think* and *how work gets done*.

### For Every Knowledge Worker

Skills aren't just for programmers. Any domain expert can encode their expertise:

- **Copywriters**: Brand voice, content frameworks, editorial standards
- **Data Analysts**: Analysis methodologies, visualization patterns, reporting SOPs
- **Marketers**: Campaign workflows, audience research, content strategies
- **Product Managers**: PRD templates, prioritization frameworks, research protocols
- **Researchers**: Literature review workflows, synthesis frameworks
- **Engineers**: Code review standards, deployment SOPs, architecture patterns

### Tool Orchestration

Skills orchestrate the agent's native tools to execute workflows:

| Tool | Capability | What Skills Orchestrate |
|------|------------|------------------------|
| **Bash** | Execute CLI commands | git, docker, npm, aws, kubectl, and the entire CLI ecosystem |
| **Read** | Access file contents | Configuration, documents, data sources |
| **Write** | Create/modify files | Reports, code, documents, structured outputs |
| **WebSearch** | Query the web | Research, fact-checking, current information |
| **WebFetch** | Retrieve URLs | Documentation, APIs, external resources |

**Bash is the universal connector.** It bridges the agent to any tool with a command-line interface. This makes skills a natural replacement for workflow automation tools like n8n or Zapier, but with natural language orchestration.

```
┌─────────────────────────────────────────────────────────────────┐
│                 Skill = Knowledge + Automation                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Domain Knowledge              Workflow Orchestration           │
│   ────────────────              ────────────────────             │
│   • Expert reasoning            • Read: gather context           │
│   • Best practices              • WebSearch: research            │
│   • Decision frameworks         • Write: produce outputs         │
│   • Quality standards           • Bash: execute actions          │
│                                                                  │
│                         ↓                                        │
│              Agent applies expertise automatically               │
│              when context matches skill description              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Example skills in this repo:**
- `commit` — Git workflow with Conventional Commits standards
- `publish` — Release workflow with validation checks
- `work` — Parallel development with git worktree orchestration
- `issue` — Issue management with structured templates
- `epic` — Project planning with progress tracking

### Why This Matters

When Anthropic introduced Skills for Claude Code, they enabled agents to carry domain expertise. But skills created locally stay local. There's no standard way to:

- Discover skills others have built
- Share skills across teams or organizations
- Version and upgrade skills over time
- Install skills to different AI agents

SkillUse addresses all of these by treating skills as **first-class packages** distributed through GitHub repositories.

### Core Design Principles

#### 1. Decentralized by Default

Unlike npm or PyPI with single central registries, SkillUse uses GitHub repositories as skill sources. This enables:

- **Private skills**: Proprietary company workflows stay internal
- **Public skills**: Community-contributed patterns for everyone
- **Multi-source**: Mix internal and external repos freely

```
skilluse repo add company/internal-skills    # Private company skills
skilluse repo add anthropics/skill-library   # Public community skills
```

#### 2. Read + Write Ecosystem

Most package managers are consumer-only. SkillUse is designed for both consumption and creation:

| Role | Commands | Purpose |
|------|----------|---------|
| Consumer | `search`, `install`, `upgrade` | Use skills others created |
| Creator | `repo init`, `publish` | Share your expertise |
| Admin | `repo add`, `repo use` | Configure sources |

This creates a virtuous cycle: engineers who implement features also encode their patterns into skills, keeping knowledge fresh and battle-tested.

#### 3. Agent-Agnostic

Skills aren't locked to one AI agent. The same skill can work across Claude Code, Cursor, Windsurf, and others. SkillUse handles the differences:

```bash
skilluse agent claude     # Install to ~/.claude/skills/
skilluse agent cursor     # Install to ~/.cursor/skills/
skilluse install review   # Goes to current agent's path
```

#### 4. Git-Native Versioning

Skills track versions using Git commit SHAs, not arbitrary version numbers:

- **Install**: Records exact commit SHA
- **Outdated check**: Compares local SHA vs remote HEAD
- **Upgrade**: Fetches latest commit, preserves local modifications warning

This mirrors how developers already think about code versions.

### The Distribution Model

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    Creator                                                      │
│    ───────                                                      │
│    1. Develop skill locally (.claude/skills/my-skill/)          │
│    2. skilluse repo init username/my-skills                     │
│    3. skilluse publish ./my-skill                               │
│                                                                 │
│                           ▼                                     │
│                                                                 │
│    Registry (GitHub Repos)                                      │
│    ───────────────────────                                      │
│    - anthropics/skill-library (public, community)               │
│    - company/internal-skills (private, organization)            │
│    - username/my-skills (public or private, personal)           │
│                                                                 │
│                           ▼                                     │
│                                                                 │
│    Consumer                                                     │
│    ────────                                                     │
│    1. skilluse repo add anthropics/skill-library                │
│    2. skilluse search code-review                               │
│    3. skilluse install code-review                              │
│    4. Skill auto-invoked by Claude when context matches         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What Makes a Good Skill

After studying effective Claude Skills patterns, we've identified five characteristics:

1. **Precise Triggers**: The description tells Claude exactly when to activate. Vague descriptions like "Use for React" create noise; specific ones like "Use when building data tables with filtering, sorting, and pagination" activate at the right moment.

2. **Progressive Disclosure**: Keep SKILL.md scannable (core patterns, key decisions). Put comprehensive details in `references/` that Claude accesses on-demand.

3. **Strong Directives**: Soft language ("consider", "might want to") gets ignored. Imperative language ("MUST", "ALWAYS", "NEVER") gets applied.

4. **Self-Contained**: Bundle templates, scripts, and examples in the skill folder. External links go stale; embedded resources persist.

5. **Maintained**: Skills need updates as patterns evolve. The same engineers using skills should be updating them—SkillUse's publish flow makes this natural.

---

## Overview

A CLI tool for managing and installing AI Coding Agent Skills (Claude Code Skills, Codex Skills, VSCode, Cursor, etc.).

## Skill Format

Skills follow the [Agent Skills Specification](https://agentskills.io/home).
Each skill directory must contain a `SKILL.md` file conforming to this standard.

## Core Features

### 1. GitHub OAuth Authentication
- Device Flow authentication (no client secret required, ideal for CLI)
- Token storage in `~/.skilluse/config.json`
- Token refresh and expiration handling

### 2. Skill Repo Management
- Add/remove GitHub repos as skill sources
- Support for public/private repo access
- Local skill index caching

### 3. Skill Installation
- Download skill files from configured repos
- Auto-detect skill type (Claude Code, Codex, etc.)
- Install to appropriate target directories

## Architecture

```
packages/cli/
├── src/
│   ├── index.tsx                 # CLI entry point
│   ├── app.tsx                   # Ink App root component
│   ├── commands/
│   │   ├── auth.tsx              # login, logout, whoami
│   │   ├── repo.tsx              # add, remove, list, use repos
│   │   └── skill.tsx             # search, install, uninstall, list, upgrade
│   ├── components/               # Ink UI components
│   │   ├── Spinner.tsx           # Loading animation
│   │   ├── Select.tsx            # Selection list
│   │   ├── Table.tsx             # Table display
│   │   ├── ProgressBar.tsx       # Progress bar
│   │   ├── StatusMessage.tsx     # Status messages (success/error/warning)
│   │   └── TextInput.tsx         # Text input
│   ├── services/
│   │   ├── github.ts             # GitHub API wrapper
│   │   ├── oauth.ts              # Device Flow implementation
│   │   └── skill.ts              # Skill management logic
│   ├── config/
│   │   └── store.ts              # Configuration file management
│   ├── hooks/                    # React Hooks
│   │   ├── useAuth.ts            # Authentication state
│   │   ├── useConfig.ts          # Configuration management
│   │   └── useGitHub.ts          # GitHub API
│   └── types/
│       └── index.ts              # Type definitions
├── package.json
└── tsconfig.json
```

## Dependencies

### Core
- `ink`: React-based terminal UI framework
- `ink-select-input`: Selection list component
- `ink-spinner`: Loading animation component
- `ink-text-input`: Text input component
- `ink-table`: Table component
- `react`: React core

### CLI & API
- `pastel`: Ink CLI framework (based on Commander)
- `@octokit/rest`: GitHub API
- `@octokit/auth-oauth-device`: OAuth Device Flow

### Utilities
- `conf`: Configuration storage
- `open`: Open browser
- `figures`: Terminal icon symbols
- `zod`: Runtime type validation

## Modern CLI Design Principles

Inspired by modern CLI tools (gh, vercel, fly, railway):

| Principle | Implementation |
|-----------|---------------|
| Concise commands | Avoid deep nesting (no `config set project` style) |
| Smart defaults | `skilluse` with no args shows status overview |
| JSON for scripting | All list commands support `--json` |
| Context override | Global `--repo` flag for any command |
| Quiet mode | `-q` for scripting (exit code only) |

## Command Design

```bash
# Status (zero-arg UX)
skilluse                    # Status overview: user, repo, skills count
skilluse status [--json]    # Explicit status command

# Authentication
skilluse login              # GitHub OAuth authentication
skilluse logout             # Clear authentication
skilluse whoami [--json]    # Show current user + installations

# Repo Management
skilluse repo               # Show current/default repo
skilluse repo list [--json] # List all configured repos
skilluse repo add <owner/repo>      # Add repo (interactive path selection)
skilluse repo add <owner/repo> --path <path>  # Add repo (specify path)
skilluse repo use <owner/repo>      # Set default repo
skilluse repo skills        # List all skills in current repo (with install status)
skilluse repo edit <owner/repo>     # Edit repo path configuration
skilluse repo remove <owner/repo>   # Remove repo
skilluse repo update [owner/repo]   # Update skill index

# Skill Operations
skilluse search <keyword>                   # Search in default repo
skilluse install <skill-name> [--repo <repo>]  # Install from repo
skilluse install <skill-name> --local       # Explicit local install
skilluse install <skill-name> --global      # Global install (~/.claude/skills/)
skilluse install <skill-name> --target <path>  # Custom location
skilluse install <owner/repo>/<skill-name>  # Install from specific repo
skilluse uninstall <skill-name>             # Uninstall skill
skilluse list [--json]                      # List installed skills
skilluse list --outdated                    # List outdated skills
skilluse upgrade [skill-name]               # Upgrade skill (no args = upgrade all)
skilluse info <skill-name>                  # Show skill details
```

### Global Flags
```bash
--repo <owner/repo>   # Override default repo for this command
--json                # Output as JSON (for list/query commands)
-q, --quiet           # Suppress output, exit code only
```

## UI Design

### Status Overview (skilluse with no args)
```
┌─────────────────────────────────────────────────────┐
│  skilluse                                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  User:     @username                                │
│  Repo:     anthropics/claude-skills (default)       │
│  Skills:   3 installed (1 outdated)                 │
│                                                     │
│  Quick actions:                                     │
│    skilluse search <query>    Search skills         │
│    skilluse repos             List repos            │
│    skilluse list --outdated   Check updates         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Login Flow
```
┌─────────────────────────────────────────────────────┐
│  SkillUse - GitHub Authentication                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ◐ Waiting for authentication...                   │
│                                                     │
│  Please visit: https://github.com/login/device     │
│  Enter code: ABCD-1234                             │
│                                                     │
│  [Press Enter to open browser]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Repo List
```
┌─────────────────────────────────────────────────────┐
│  Configured Repos                                   │
├─────────────────────────────────────────────────────┤
│  ● anthropics/claude-skills    skills/    (default)│
│  ○ company/internal-skills     prompts/            │
│  ○ my/personal-skills          (all)               │
└─────────────────────────────────────────────────────┘
```

### Install Progress
```
┌─────────────────────────────────────────────────────┐
│  Installing: code-review (local)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✔ Fetching skill metadata                         │
│  ✔ Downloading files (3/3)                         │
│  ◐ Installing to ./.claude/skills/code-review      │
│  ○ Verifying installation                          │
│                                                     │
│  ████████████░░░░░░░░  60%                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Skill List (Table)
```
┌──────────────────┬────────────┬──────────────────────┬─────────┐
│ Name             │ Type       │ Repo                 │ Version │
├──────────────────┼────────────┼──────────────────────┼─────────┤
│ code-review      │ claude     │ anthropics/skills    │ 1.2.0   │
│ test-generator   │ codex      │ company/internal     │ 0.8.1   │
│ doc-writer       │ cursor     │ my/personal-skills   │ 2.0.0   │
└──────────────────┴────────────┴──────────────────────┴─────────┘
```

## Skill Target Directories

| Agent Type  | Target Directory |
|-------------|------------------|
| Claude Code | `~/.claude/skills/` |
| Codex       | `~/.codex/skills/` |
| VSCode      | `~/.vscode/skills/` |
| Cursor      | `~/.cursor/skills/` |
| Custom      | User specified |

## Version Tracking Mechanism

### Git Commit SHA as Source of Truth

Version tracking uses Git commit SHA as the primary identifier, with optional SKILL.md version for display.

| Field | Purpose |
|-------|---------|
| `commitSha` | Git commit SHA when installed (primary version identifier) |
| `version` | Human-readable version from SKILL.md metadata (optional) |

### Version Check Logic

```bash
skilluse list --outdated
```

| Scenario | Detection | Action |
|----------|-----------|--------|
| Remote commit SHA ≠ local SHA | Outdated | Prompt to upgrade |
| SKILL.md version changed | Informational | Show version diff |
| Files modified but same SHA | N/A | Already up-to-date |

### List Filtering Behavior

The `list` command applies intelligent filtering to show only relevant skills:

| Filter | Behavior |
|--------|----------|
| **Agent filter** | Only shows skills for current agent |
| **CWD filter** | Local skills only appear when running from the project where installed |
| **Filesystem check** | Skills whose `installedPath` no longer exists are automatically hidden |

This means:
- Local skills installed in Project A won't appear when running `skilluse list` in Project B
- Global skills (`~/.claude/skills/`) appear in all directories
- Manually deleted skill folders are automatically cleaned from list output

### Upgrade Behavior

```
$ skilluse list --outdated

  Outdated skills:

  Name          Installed    Latest       Repo
  code-review   a1b2c3d      f7e8d9c      anthropics/skills
                (v1.0.0)     (v1.2.0)

$ skilluse upgrade code-review

  ✔ Fetched latest commit f7e8d9c
  ✔ Downloaded 3 files
  ✔ Installed to ./.claude/skills/code-review

  Upgraded: v1.0.0 → v1.2.0
```

### Version Inconsistency Handling

When local files don't match any known commit (user manually edited):

```
$ skilluse list

  Name          Status       Repo
  code-review   modified     anthropics/skills
                (local changes detected)

$ skilluse upgrade code-review

  ⚠ Local modifications detected in code-review.

  Options:
  ❯ Overwrite local changes
    Keep local, skip upgrade
    Show diff
    Cancel
```

## Conflict Resolution

### Same Skill Name in Multiple Repos

When a skill name exists in multiple configured repos:

```
$ skilluse install code-review

  ⚠ "code-review" found in multiple repos:

  ❯ anthropics/skills      v1.2.0  (default repo)
    company/internal       v2.0.1

  Use arrow keys to select, or specify:
  skilluse install anthropics/skills/code-review
```

### Resolution Priority

1. If skill name includes repo prefix (`owner/repo/skill`), use specified repo
2. If only one repo has the skill, use that
3. If multiple repos have the skill, prompt user to select

For CI/scripting, always use explicit syntax: `skilluse install owner/repo/skill-name`

## Configuration File Structure

```jsonc
// ~/.skilluse/config.json
{
  "auth": {
    "token": "ghu_xxx",
    "user": "username"
  },
  "defaultRepo": "anthropics/claude-skills",
  "repos": [
    {
      "repo": "anthropics/claude-skills",
      "branch": "main",
      "paths": ["/"]
    },
    {
      "repo": "company/internal-skills",
      "branch": "main",
      "paths": ["skills/claude/", "skills/codex/"]
    }
  ],
  "installed": [
    {
      "name": "code-review",
      "repo": "anthropics/claude-skills",
      "repoPath": "skills/code-review",
      "commitSha": "a1b2c3d4e5f6...",
      "version": "1.0.0",
      "type": "claude-code",
      "installedPath": ".claude/skills/code-review",
      "scope": "local"
    },
    {
      "name": "doc-writer",
      "repo": "anthropics/claude-skills",
      "repoPath": "skills/doc-writer",
      "commitSha": "f7e8d9c0b1a2...",
      "version": "2.0.0",
      "type": "claude-code",
      "installedPath": "~/.claude/skills/doc-writer",
      "scope": "global"
    }
  ]
}
```

## Repo Path Configuration

### Auto-Discovery Mechanism

The CLI auto-discovers available skill paths by scanning for `SKILL.md` files:
- Traverse repo directory structure
- Find directories containing `SKILL.md`
- Extract parent paths as candidates

### Usage

```bash
# 1. Interactive mode (no --path argument)
#    Auto-scan repo and show paths with SKILL.md for selection
skilluse repo add owner/repo

# 2. Quick mode (specify --path)
#    Skip interaction and use specified paths directly
skilluse repo add owner/repo --path skills/
skilluse repo add owner/repo --path skills/claude/ --path skills/codex/

# 3. Specify branch
skilluse repo add owner/repo --branch develop

# 4. Non-interactive mode (for CI environments)
skilluse repo add owner/repo --no-interactive  # Use all discovered paths
```

### Interactive Path Selection UI

```
$ skilluse repo add anthropics/claude-skills

  Scanning repo for skills...

  ┌─ Found 3 paths with SKILL.md ────────────────────┐
  │                                                  │
  │  Select paths to include:                        │
  │                                                  │
  │  [●] skills/code-review/      (2 skills)         │
  │  [●] skills/doc-writer/       (1 skill)          │
  │  [ ] skills/experimental/     (3 skills)         │
  │                                                  │
  │  ↑↓ navigate  ␣ toggle  a select all  ⏎ confirm │
  │                                                  │
  └──────────────────────────────────────────────────┘

  ✔ Added anthropics/claude-skills
    Paths: skills/code-review/, skills/doc-writer/
    Skills available: 3
```

### Handling Missing SKILL.md

```
$ skilluse repo add owner/empty-repo

  Scanning repo for skills...

  ⚠ No SKILL.md files found in this repo.

  Options:
  ❯ Specify path manually
    Add anyway (use root path)
    Cancel
```

### Modifying Existing Repo

```bash
# Re-enter interactive selection
skilluse repo edit owner/repo

# Directly overwrite path configuration
skilluse repo add owner/repo --path new/path/  # Updates if already exists
```

## Implementation Phases

### Phase 1: Project Setup
1. Initialize packages/cli as npm package
2. Configure TypeScript + React JSX
3. Set up Ink + Pastel CLI framework
4. Create base UI components

### Phase 2: Authentication Module
5. Implement GitHub OAuth Device Flow
6. Implement token storage and management
7. Build login UI (Spinner + status messages)
8. Add login/logout/whoami commands

### Phase 3: Repo Management
9. Implement SKILL.md auto-discovery scanning
10. Build interactive path selection UI
11. Implement repo add/edit/remove/list/use commands
12. GitHub repo access validation
13. Implement repo sync index refresh

### Phase 4: Skill Management
14. Implement skill search functionality
15. Build installation progress UI (ProgressBar + step list)
16. Implement file download and installation
17. Add install/uninstall/list/upgrade/info commands

### Phase 5: Polish
18. Error handling and user feedback
19. Add tests
20. Write README documentation

## Key Files

- `packages/cli/src/index.tsx` - Main entry point
- `packages/cli/src/app.tsx` - Ink App root component
- `packages/cli/src/components/` - UI component library
- `packages/cli/src/services/oauth.ts` - OAuth core logic
- `packages/cli/src/services/github.ts` - GitHub API wrapper
- `packages/cli/src/commands/repo.tsx` - Repo management commands
- `packages/cli/src/commands/skill.tsx` - Skill management commands
