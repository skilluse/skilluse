/**
 * Skill discovery service
 * Scans GitHub repositories for SKILL.md files and extracts skill paths
 */

import {
	buildGitHubHeaders,
	getGitHubErrorMessage,
	isAuthRequired,
} from "./github.js";

const GITHUB_API_URL = "https://api.github.com";

export interface TreeItem {
	path: string;
	mode: string;
	type: "blob" | "tree";
	sha: string;
	url: string;
}

interface TreeResponse {
	sha: string;
	url: string;
	tree: TreeItem[];
	truncated: boolean;
}

export interface SkillPath {
	path: string;
	skillCount: number;
}

export interface DiscoveryResult {
	skillPaths: SkillPath[];
	totalSkills: number;
	truncated: boolean;
}

/**
 * Discover SKILL.md files in a repository
 * Returns authRequired if private repo access is denied
 */
export async function discoverSkillPaths(
	owner: string,
	repo: string,
	branch: string,
	token?: string,
): Promise<DiscoveryResult | { authRequired: true; message: string }> {
	const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

	const response = await fetch(url, {
		headers: buildGitHubHeaders(token),
	});

	if (!response.ok) {
		if (isAuthRequired(response)) {
			return {
				authRequired: true,
				message: getGitHubErrorMessage(response),
			};
		}
		if (response.status === 404) {
			// 404 could mean: repo doesn't exist, branch doesn't exist, or private repo (unauthenticated)
			// If no token was provided, suggest it might be private
			if (!token) {
				return {
					authRequired: true,
					message: `Repository ${owner}/${repo} not found. If this is a private repo, run 'skilluse login' first.`,
				};
			}
			throw new Error(
				`Repository ${owner}/${repo} not found or branch '${branch}' doesn't exist`,
			);
		}
		const error = await response.text();
		throw new Error(
			`Failed to fetch repository tree: ${response.status} - ${error}`,
		);
	}

	const data = (await response.json()) as TreeResponse;

	// Find all SKILL.md files
	const skillFiles = data.tree.filter(
		(item) => item.type === "blob" && item.path.endsWith("/SKILL.md"),
	);

	// Extract parent directories and count skills per directory
	const pathCounts = extractParentPaths(skillFiles.map((f) => f.path));

	return {
		skillPaths: pathCounts,
		totalSkills: skillFiles.length,
		truncated: data.truncated,
	};
}

/**
 * Extract unique parent directories from SKILL.md paths
 * Groups skills by their common parent directories
 *
 * Example:
 * - skills/pdf/SKILL.md, skills/commit/SKILL.md -> skills/ (2 skills)
 * - tools/lint/SKILL.md -> tools/ (1 skill)
 */
export function extractParentPaths(skillMdPaths: string[]): SkillPath[] {
	// Get the immediate parent directory of each SKILL.md
	// e.g., "skills/pdf/SKILL.md" -> "skills/pdf/"
	const skillDirs = skillMdPaths.map((p) => {
		const parts = p.split("/");
		parts.pop(); // Remove SKILL.md
		return parts.join("/") + "/";
	});

	// Find common parent directories
	// Group by depth-1 parent to identify skill collections
	const parentCounts = new Map<string, number>();

	for (const skillDir of skillDirs) {
		const parts = skillDir.split("/").filter(Boolean);
		if (parts.length >= 2) {
			// e.g., "skills/pdf/" -> "skills/"
			const parentPath = parts[0] + "/";
			parentCounts.set(parentPath, (parentCounts.get(parentPath) || 0) + 1);
		} else if (parts.length === 1) {
			// e.g., "pdf/" -> root level skill
			const parentPath = parts[0] + "/";
			parentCounts.set(parentPath, (parentCounts.get(parentPath) || 0) + 1);
		}
	}

	// Convert to array and sort by skill count (descending)
	const result: SkillPath[] = Array.from(parentCounts.entries())
		.map(([path, skillCount]) => ({ path, skillCount }))
		.sort((a, b) => b.skillCount - a.skillCount);

	return result;
}
