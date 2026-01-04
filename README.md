# SkillUse

```
 ▗▄▄▖▗▖ ▗▖▗▄▄▄▖▗▖   ▗▖   ▗▖ ▗▖ ▗▄▄▖▗▄▄▄▖
▐▌   ▐▌▗▞▘  █  ▐▌   ▐▌   ▐▌ ▐▌▐▌   ▐▌
 ▝▀▚▖▐▛▚▖   █  ▐▌   ▐▌   ▐▌ ▐▌ ▝▀▚▖▐▛▀▀▘
▗▄▄▞▘▐▌ ▐▌▗▄█▄▖▐▙▄▄▖▐▙▄▄▖▝▚▄▞▘▗▄▄▞▘▐▙▄▄▖
```

**A Skills Registry for AI Agents.**

SkillUse is a package manager for AI agent skills. Discover, install, and publish skills across multiple AI agents—Claude Code, Cursor, Windsurf, and more.

## Why SkillUse?

**For Individuals**
- Reuse your best prompts and workflows across projects
- Share expertise with the community
- Switch between AI agents without rebuilding your skill library

**For Teams**
- Standardize workflows and best practices across the organization
- Onboard new members faster with institutional knowledge encoded in skills
- Keep private skills internal while consuming public community skills

**Key Features**
- **Multi-Agent**: One CLI for all AI agents, automatic path detection
- **Read + Write**: Not just install—create and publish your own skills
- **GitHub-Based**: Use any GitHub repo as a skill registry—public or private
- **Version Tracking**: Git-based versioning with upgrade detection

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

## Authentication

| Repository Type | Login Required |
|-----------------|----------------|
| Public repo | No |
| Private repo | Yes |

For private repositories:
```bash
skilluse login
skilluse repo add mycompany/private-skills
```

## Commands

### Status & Auth
```bash
skilluse              # Show status
skilluse login        # Authenticate with GitHub
skilluse logout       # Clear credentials
```

### Skill Management
```bash
skilluse install <skill-name>               # Install from configured repo
skilluse install <github-url>               # Install from GitHub URL
skilluse install <skill-name> -g            # Install globally
skilluse uninstall <skill-name>             # Remove skill
skilluse upgrade [skill-name]               # Upgrade to latest
skilluse list                               # List installed
skilluse list --outdated                    # Check for updates
skilluse publish <skill-name>               # Publish skill to repo
```

Example with GitHub URL:
```bash
skilluse install https://github.com/owner/repo/tree/main/skills/code-review
```

### Repository Management
```bash
skilluse repo list                 # List repositories
skilluse repo add <owner/repo>     # Add repository
skilluse repo use <owner/repo>     # Set default
skilluse repo skills               # List all skills in current repo
skilluse repo remove <owner/repo>  # Remove repository
```

### Multi-Agent Support
```bash
skilluse agent                 # Select agent interactively
skilluse agent <name>          # Switch to agent
```

Supported: `claude`, `cursor`, `windsurf`, `codex`, `copilot`, `cline`, `roo`, `aider`, `continue`

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   GitHub Repositories (Skill Registries)                        │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│   │ Public Repo  │  │ Company Repo │  │ Personal Repo│          │
│   │ (community)  │  │  (private)   │  │  (private)   │          │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│          │                 │                 │                  │
│          └─────────────────┼─────────────────┘                  │
│                            ▼                                    │
│                     ┌────────────┐                              │
│                     │  skilluse  │                              │
│                     └─────┬──────┘                              │
│                           │                                     │
│          ┌────────────────┼────────────────┐                    │
│          ▼                ▼                ▼                    │
│   ~/.claude/skills  ~/.cursor/skills  ~/.windsurf/skills        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Installation Paths

| Scope | Path |
|-------|------|
| Local | `./.claude/skills/<skill-name>/` |
| Global | `~/.claude/skills/<skill-name>/` |

## Security

- **Credentials**: JSON file with restricted permissions (0600)
- **Location**: `~/Library/Application Support/skilluse/` (macOS)
- **Auth**: GitHub App OAuth device flow

## Learn More

- [Documentation](https://skilluse.dev/docs)
- [Blog](https://skilluse.dev/blog)
- [Skill Format Specification](https://agentskills.io)

## License

MIT


![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)