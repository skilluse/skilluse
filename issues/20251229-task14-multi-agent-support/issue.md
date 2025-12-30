# Multi-Agent Support

## Overview

Support multiple AI coding agents (Claude Code, Cursor, Amp, VS Code, Goose, etc.) with agent-specific installation paths. Users can switch between agents and install skills to the appropriate location for each agent.

## Requirements

1. Agent configuration service with path mappings for each supported agent
2. `agent` command to list supported agents and show current selection
3. `agent use <name>` command to switch default agent
4. Store current agent selection in config
5. Update install/uninstall/list commands to use current agent's paths
6. Unified installation source syntax (repo, GitHub, local path)

## Supported Agents

| Agent | ID | Local Path | Global Path |
|-------|-----|------------|-------------|
| Claude Code | `claude` | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `cursor` | `.cursor/skills/` | `.cursor/skills/` |
| Amp | `amp` | `.amp/skills/` | `~/.amp/skills/` |
| VS Code / Copilot | `vscode` | `.github/skills/` | `.github/skills/` |
| Goose | `goose` | `.goose/skills/` | `~/.config/goose/skills/` |
| OpenCode | `opencode` | `.opencode/skills/` | `~/.opencode/skills/` |
| Codex | `codex` | `.codex/skills/` | `~/.codex/skills/` |
| Letta | `letta` | `.letta/skills/` | `~/.letta/skills/` |
| Portable | `project` | `.skills/` | `.skills/` |

## Technical Details

### Agent Service (`services/agents.ts`)

```typescript
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  localPath: string;
  globalPath: string;
}

export const AGENTS: Record<string, AgentConfig> = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    description: 'Anthropic Claude Code CLI',
    localPath: '.claude/skills',
    globalPath: path.join(os.homedir(), '.claude/skills'),
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    description: 'Cursor AI Editor',
    localPath: '.cursor/skills',
    globalPath: '.cursor/skills', // Cursor only supports project-level
  },
  // ... other agents
};

export function getAgent(id: string): AgentConfig | undefined;
export function listAgents(): AgentConfig[];
export function getSkillsPath(agentId: string, scope: 'local' | 'global'): string;
```

### Store Updates (`services/store.ts`)

Add `currentAgent` field to config:

```typescript
interface Config {
  currentAgent: string; // default: 'claude'
  // ... existing fields
}

export function getCurrentAgent(): string;
export function setCurrentAgent(agentId: string): void;
```

### Agent Commands (`commands/agent/`)

```
commands/agent/
├── index.tsx      # skilluse agent (list agents, show current)
└── use.tsx        # skilluse agent use <name>
```

### Unified Install Source

The install command should parse the source argument:

```typescript
type InstallSource =
  | { type: 'repo'; name: string }           // "pdf" -> from configured repos
  | { type: 'github'; owner: string; repo: string; path?: string }  // "owner/repo" or "owner/repo/path"
  | { type: 'local'; path: string };         // "./path" or "/absolute/path"

function parseInstallSource(source: string): InstallSource {
  if (source.startsWith('./') || source.startsWith('/')) {
    return { type: 'local', path: source };
  }
  if (source.includes('/')) {
    const parts = source.split('/');
    if (parts.length === 2) {
      return { type: 'github', owner: parts[0], repo: parts[1] };
    }
    return { type: 'github', owner: parts[0], repo: parts[1], path: parts.slice(2).join('/') };
  }
  return { type: 'repo', name: source };
}
```

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- task09-skill-install (install/uninstall infrastructure)
- task05-config-store (config storage)

## Out of Scope

- Cross-agent sync (e.g., `skill sync --from cursor --to claude`)
- Agent auto-detection based on current directory
- Agent-specific skill compatibility checking
