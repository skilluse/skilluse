# Skilluse CLI

CLI tool for managing and installing AI Coding Agent Skills.

## Installation

```bash
npm install -g skilluse
```

## Quick Start

```bash
# Login to GitHub
skilluse login

# Add a skill repository
skilluse repo add owner/skill-repo

# Search for skills
skilluse search code-review

# Install a skill
skilluse install code-review

# List installed skills
skilluse list
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

## Authentication

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

- **User tokens** stored in system keychain (macOS/Windows/Linux)
- **Fallback** to encrypted file if keychain unavailable

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SKILLUSE_GITHUB_CLIENT_ID` | Override GitHub App client ID (dev only) |
