/**
 * Multi-agent support service.
 *
 * Provides configuration and path mappings for various AI coding agents.
 */

import { homedir } from "node:os";
import { join } from "node:path";

export interface AgentConfig {
	id: string;
	name: string;
	description: string;
	localPath: string;
	globalPath: string;
}

export const AGENTS: Record<string, AgentConfig> = {
	claude: {
		id: "claude",
		name: "Claude Code",
		description: "Anthropic Claude Code CLI",
		localPath: ".claude/skills",
		globalPath: join(homedir(), ".claude/skills"),
	},
	cursor: {
		id: "cursor",
		name: "Cursor",
		description: "Cursor AI Editor",
		localPath: ".cursor/skills",
		globalPath: ".cursor/skills", // Cursor only supports project-level
	},
	amp: {
		id: "amp",
		name: "Amp",
		description: "Sourcegraph Amp CLI",
		localPath: ".amp/skills",
		globalPath: join(homedir(), ".amp/skills"),
	},
	vscode: {
		id: "vscode",
		name: "VS Code / Copilot",
		description: "Visual Studio Code with GitHub Copilot",
		localPath: ".github/skills",
		globalPath: ".github/skills", // VS Code only supports project-level
	},
	goose: {
		id: "goose",
		name: "Goose",
		description: "Block Goose AI Agent",
		localPath: ".goose/skills",
		globalPath: join(homedir(), ".config/goose/skills"),
	},
	opencode: {
		id: "opencode",
		name: "OpenCode",
		description: "OpenCode CLI",
		localPath: ".opencode/skills",
		globalPath: join(homedir(), ".opencode/skills"),
	},
	codex: {
		id: "codex",
		name: "Codex",
		description: "OpenAI Codex CLI",
		localPath: ".codex/skills",
		globalPath: join(homedir(), ".codex/skills"),
	},
	letta: {
		id: "letta",
		name: "Letta",
		description: "Letta AI Agent",
		localPath: ".letta/skills",
		globalPath: join(homedir(), ".letta/skills"),
	},
	project: {
		id: "project",
		name: "Portable",
		description: "Portable agent-agnostic skills directory",
		localPath: ".skills",
		globalPath: ".skills", // Portable is always project-level
	},
};

/**
 * Get agent configuration by ID.
 */
export function getAgent(id: string): AgentConfig | undefined {
	return AGENTS[id];
}

/**
 * List all supported agents.
 */
export function listAgents(): AgentConfig[] {
	return Object.values(AGENTS);
}

/**
 * Get the skills installation path for an agent.
 *
 * @param agentId - The agent ID (e.g., 'claude', 'cursor')
 * @param scope - 'local' for project-level, 'global' for user-level
 * @returns The full path to the skills directory
 */
export function getSkillsPath(agentId: string, scope: "local" | "global"): string {
	const agent = AGENTS[agentId];
	if (!agent) {
		throw new Error(`Unknown agent: ${agentId}`);
	}

	if (scope === "global") {
		return agent.globalPath;
	}

	// Local path is relative to cwd
	return join(process.cwd(), agent.localPath);
}
