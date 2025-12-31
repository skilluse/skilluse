# SkillUse

**A decentralized Skills Registry for AI Agents.**

SkillUse enables teams to discover, install, create, and publish skills across AI agents. It transforms expert knowledge and workflows into portable, shareable, and executable skill packages—for every knowledge worker.

## Design Philosophy

### Skills = Domain Knowledge + Workflow Automation

A skill empowers AI agents with two complementary capabilities:

| Dimension | What It Provides | Examples |
|-----------|-----------------|----------|
| **Domain Knowledge** | Expert reasoning, best practices, decision frameworks | Brand voice guidelines, analysis methodologies, quality standards |
| **Workflow Automation** | Executable SOPs that orchestrate agent tools | Research → analyze → write → review pipelines |

This dual nature makes skills powerful. They don't just tell the agent *what* to do—they encode *how experts think* and *how work gets done*.

### For Every Knowledge Worker

Skills aren't just for programmers. Any domain expert can encode their expertise:

| Role | Example Skills |
|------|---------------|
| **Copywriter** | Brand voice guidelines, content frameworks, editorial standards |
| **Data Analyst** | Analysis methodologies, visualization patterns, reporting templates |
| **Marketer** | Campaign planning workflows, audience research frameworks |
| **Product Manager** | PRD templates, user research protocols, prioritization frameworks |
| **Engineer** | Code review standards, deployment SOPs, architecture patterns |
| **Researcher** | Literature review workflows, synthesis frameworks |

### Tool Orchestration: The Agent's Hands

Skills orchestrate the agent's native tools to execute workflows:

| Tool | Capability | What Skills Orchestrate |
|------|------------|------------------------|
| **Bash** | Execute CLI commands | git, docker, npm, aws, and the entire CLI ecosystem |
| **Read** | Access files | Configuration, documents, data sources |
| **Write** | Create content | Reports, code, documents, structured outputs |
| **WebSearch** | Query the web | Research, fact-checking, current information |
| **WebFetch** | Retrieve URLs | Documentation, APIs, external resources |

**Bash is the universal connector.** It bridges the agent to any tool with a command-line interface—version control, cloud infrastructure, databases, CI/CD systems. This makes skills a natural replacement for workflow automation tools like n8n or Zapier, but with natural language orchestration.

```
┌─────────────────────────────────────────────────────────────-────┐
│                 Skill = Knowledge + Automation                   │
├──────────────────────────────────────────────────────────────-───┤
│                                                                  │
│   Domain Knowledge              Workflow Orchestration           │
│   ────────────────              ────────────────────             │
│   • Expert reasoning            • Read: gather context           │
│   • Best practices              • WebSearch: research            │
│   • Decision frameworks         • Write: produce outputs         │
│   • Quality standards           • Bash: execute actions          │
│                                                                  │
│                                                                  │
│              Agent applies expertise automatically               │
│              when context matches skill description              │
│                                                                  │
└───────────────────────────────────────────────────────────────-──┘
```

### The Problem: Siloed Expertise

Every organization faces the same challenge:

- Best practices live in someone's head or scattered documentation
- Workflows differ between teams with no standardization
- When experts are unavailable, work stalls
- When they leave, institutional knowledge disappears

This affects every knowledge worker—not just engineers.

### The Solution: A Decentralized Skills Registry

SkillUse treats skills as **first-class packages**—like npm for AI agent capabilities. But instead of a single centralized registry, it uses GitHub repositories as skill sources, enabling:

- **Private skills** for proprietary workflows within organizations
- **Public skills** for open-source community patterns
- **Multi-source configuration** mixing internal and external skill repos

```
┌─────────────────────────────────────────────────────────────────┐
│                     Skills Registry Model                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│   │ Public Repo  │     │ Company Repo │     │ Personal Repo│    │
│   │ (community)  │     │  (internal)  │     │   (private)  │    │
│   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘    │
│          │                    │                    │            │
│          └────────────────────┼────────────────────┘            │
│                               ▼                                 │
│                    ┌──────────────────┐                         │
│                    │   skilluse CLI   │                         │
│                    │  search/install  │                         │
│                    │  publish/create  │                         │
│                    └────────┬─────────┘                         │
│                             │                                   │
│          ┌──────────────────┼──────────────────┐                │
│          ▼                  ▼                  ▼                │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐          │
│   │Claude Code │     │   Cursor   │     │  Windsurf  │          │
│   │  .claude/  │     │  .cursor/  │     │ .windsurf/ │          │
│   └────────────┘     └────────────┘     └────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Read + Write: A Complete Ecosystem

Most package managers are consumer-only. SkillUse is designed for **both consumption and creation**:

| Capability | Commands |
|------------|----------|
| **Consume** | `search`, `install`, `upgrade`, `list` |
| **Create** | `repo init`, `publish` |
| **Configure** | `repo add`, `repo use`, `agent` |

This bidirectional flow creates a virtuous cycle: domain experts encode their knowledge into skills, teams consume and refine them, keeping expertise fresh and grounded in real practice.

### Multi-Agent Support

Skills aren't tied to a single AI agent. SkillUse installs skills to the correct location based on your current agent:

| Agent | Skills Path |
|-------|-------------|
| Claude Code | `~/.claude/skills/` |
| Cursor | `~/.cursor/skills/` |
| Windsurf | `~/.codeium/windsurf/skills/` |
| Codex | `~/.codex/skills/` |

Switch agents seamlessly with `skilluse agent <name>`.

## Quick Start

```bash
# Install
npm install -g skilluse

# Authenticate with GitHub
skilluse login

# Add a skill repository
skilluse repo add anthropics/skill-library

# Search and install skills
skilluse search code-review
skilluse install code-review

# List installed skills
skilluse list
```

## Commands

### Authentication
| Command | Description |
|---------|-------------|
| `skilluse` | Show status (user, repos, installed skills) |
| `skilluse login` | Authenticate with GitHub |
| `skilluse logout` | Clear stored credentials |

### Skill Management
| Command | Description |
|---------|-------------|
| `skilluse search <keyword>` | Search for skills |
| `skilluse install <skill>` | Install skill locally |
| `skilluse install <skill> -g` | Install globally |
| `skilluse uninstall <skill>` | Remove installed skill |
| `skilluse upgrade [skill]` | Upgrade skill(s) to latest |
| `skilluse list` | List installed skills |
| `skilluse info <skill>` | Show skill details |

### Repository Management
| Command | Description |
|---------|-------------|
| `skilluse repo list` | List configured repositories |
| `skilluse repo add <repo>` | Add a skill repository |
| `skilluse repo remove <repo>` | Remove a repository |
| `skilluse repo use <repo>` | Set default repository |
| `skilluse repo init <repo>` | Create new skills repository (coming soon) |

### Publishing (Coming Soon)
| Command | Description |
|---------|-------------|
| `skilluse publish <path>` | Publish local skill to repository |

### Agent Management
| Command | Description |
|---------|-------------|
| `skilluse agent` | List/select agents interactively |
| `skilluse agent <name>` | Switch to specified agent |

## What Makes a Good Skill

Based on real-world usage, effective skills share these characteristics:

1. **Precise triggers** - Clear description helps the agent know when to activate. "Use for React components" is too broad. "Use when creating data tables with filtering and pagination" works better.

2. **Progressive detail** - Keep the main SKILL.md scannable. Put comprehensive guidance in a `references/` folder that the agent accesses when needed.

3. **Strong directives** - "Consider using error boundaries" gets ignored. "MUST implement error boundaries for all data-fetching components" gets applied.

4. **Bundled resources** - Include scripts, templates, and example code directly in the skill folder rather than linking elsewhere.

## Installation Paths

| Scope | Path |
|-------|------|
| Local (project) | `./.claude/skills/<name>/` |
| Global (user) | `~/.claude/skills/<name>/` |

## Security

- **Credentials**: Stored in JSON file with restricted permissions (0600)
- **Location**: `~/Library/Application Support/skilluse/auth.json` (macOS), `~/.config/skilluse/` (Linux), `%APPDATA%/skilluse/` (Windows)
- **OAuth**: GitHub App device flow authentication

## Learn More

- [Skill Format Specification](https://agentskills.io)
- [CLI Design Document](./design.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## License

MIT
