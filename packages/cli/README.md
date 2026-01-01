# Skilluse CLI

A decentralized Skills Registry CLI for AI Coding Agents.

SkillUse enables teams to **discover, install, create, and publish** skills across multiple AI agents (Claude Code, Cursor, Windsurf, etc.). It treats skills as first-class packages distributed through GitHub repositories—supporting both public community skills and private organizational knowledge.

See the [main README](../../README.md) for design philosophy and the [design document](../../design.md) for technical details.

## Installation

```bash
# npm (recommended)
npm install -g skilluse

# or shell script (macOS/Linux)
curl -fsSL https://skilluse.dev/install.sh | bash
```

## Quick Start

```bash
# 1. Add a skill repository
skilluse repo add owner/skill-repo

# 2. Install a skill
skilluse install code-review
```

## Commands

### Authentication

| Command | Description |
|---------|-------------|
| `skilluse` | Show status (user, repos, installed count) |
| `skilluse login` | Authenticate with GitHub |
| `skilluse logout` | Clear stored credentials |

### Repository Management

| Command | Description |
|---------|-------------|
| `skilluse repo list` | List configured repositories |
| `skilluse repo add <repo>` | Add a skill repository |
| `skilluse repo remove <name>` | Remove a repository |
| `skilluse repo use <name>` | Set default repository |
| `skilluse repo edit <name>` | Edit repository settings |

### Skill Management

| Command | Description |
|---------|-------------|
| `skilluse search <keyword>` | Search for skills |
| `skilluse install <skill>` | Install skill locally |
| `skilluse install <skill> --global` | Install globally |
| `skilluse uninstall <skill>` | Remove installed skill |
| `skilluse upgrade [skill]` | Upgrade skill(s) to latest |
| `skilluse list` | List installed skills |
| `skilluse list --outdated` | Show skills with updates |
| `skilluse info <skill>` | Show skill details |

### Agent Management

| Command | Description |
|---------|-------------|
| `skilluse agent` | List/select agent interactively |
| `skilluse agent <name>` | Switch to specified agent |

Supported agents: `claude`, `cursor`, `windsurf`, `codex`, `copilot`, `cline`, `roo`, `aider`, `continue`

## Authentication

| Repository Type | Login Required |
|-----------------|----------------|
| Public repo | No |
| Private repo | Yes |

Skilluse uses GitHub App OAuth for authentication.

### First-Time Login

1. Run `skilluse login`
2. Enter the code shown in your browser
3. Install the GitHub App when prompted
4. Select repository access (all or specific repos)

### Managing Repository Access

Modify access at: https://github.com/settings/installations

### Logging Out

```bash
skilluse logout
```

## Install Locations

| Scope | Path |
|-------|------|
| Local | `./.claude/skills/<name>/` |
| Global | `~/.claude/skills/<name>/` |

## Security

- **User tokens** stored in JSON file with restricted permissions (0600)
- **Location** follows OS conventions via env-paths

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SKILLUSE_GITHUB_CLIENT_ID` | Override GitHub App client ID (dev only) |
