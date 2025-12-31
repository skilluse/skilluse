# SkillUse

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

## Quick Start

```bash
# Install
npm install -g skilluse

# Authenticate with GitHub
skilluse login

# Add a skill repository
skilluse repo add anthropics/skill-library

# Search and install
skilluse search code-review
skilluse install code-review

# List installed skills
skilluse list
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
skilluse search <keyword>      # Search for skills
skilluse install <skill>       # Install locally
skilluse install <skill> -g    # Install globally
skilluse uninstall <skill>     # Remove skill
skilluse upgrade [skill]       # Upgrade to latest
skilluse list                  # List installed
skilluse list --outdated       # Check for updates
skilluse info <skill>          # Show details
```

### Repository Management
```bash
skilluse repo list             # List repositories
skilluse repo add <repo>       # Add repository
skilluse repo remove <repo>    # Remove repository
skilluse repo use <repo>       # Set default
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
| Local | `./.claude/skills/<name>/` |
| Global | `~/.claude/skills/<name>/` |

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
