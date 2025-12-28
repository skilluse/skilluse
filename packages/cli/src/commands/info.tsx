import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	getConfig,
	getCredentials,
	type InstalledSkill,
	type RepoConfig,
} from "../services/index.js";

export const args = z.tuple([
	z.string().describe("Skill name to show info for"),
]);

export const options = z.object({});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

interface SkillInfo {
	name: string;
	description: string;
	version: string;
	type?: string;
	author?: string;
	tags?: string[];
	repo: string;
	repoPath: string;
	installedPath?: string;
	scope?: "local" | "global";
	commitSha?: string;
	installed: boolean;
}

type InfoState =
	| { phase: "checking" }
	| { phase: "not_logged_in" }
	| { phase: "loading" }
	| { phase: "not_found"; skillName: string }
	| { phase: "success"; info: SkillInfo }
	| { phase: "error"; message: string };

/**
 * Parse YAML frontmatter from SKILL.md content
 */
function parseFrontmatter(content: string): Record<string, unknown> {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) return {};

	const yaml = frontmatterMatch[1];
	const result: Record<string, unknown> = {};

	for (const line of yaml.split("\n")) {
		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) continue;
		const key = line.substring(0, colonIndex).trim();
		let value: unknown = line.substring(colonIndex + 1).trim();

		// Handle arrays like [tag1, tag2]
		if (
			typeof value === "string" &&
			value.startsWith("[") &&
			value.endsWith("]")
		) {
			value = value
				.slice(1, -1)
				.split(",")
				.map((s) => s.trim());
		}

		if (key) result[key] = value;
	}

	return result;
}

/**
 * Get skill info from an installed skill's SKILL.md
 */
async function getLocalSkillInfo(
	skill: InstalledSkill,
): Promise<SkillInfo | null> {
	try {
		const skillMdPath = join(skill.installedPath, "SKILL.md");
		const content = await readFile(skillMdPath, "utf-8");
		const frontmatter = parseFrontmatter(content);

		return {
			name: String(frontmatter.name || skill.name),
			description: String(frontmatter.description || ""),
			version: String(frontmatter.version || skill.version),
			type: frontmatter.type ? String(frontmatter.type) : skill.type,
			author: frontmatter.author ? String(frontmatter.author) : undefined,
			tags: Array.isArray(frontmatter.tags)
				? frontmatter.tags.map(String)
				: undefined,
			repo: skill.repo,
			repoPath: skill.repoPath,
			installedPath: skill.installedPath,
			scope: skill.scope,
			commitSha: skill.commitSha,
			installed: true,
		};
	} catch {
		// Fall back to config info
		return {
			name: skill.name,
			description: "",
			version: skill.version,
			type: skill.type,
			repo: skill.repo,
			repoPath: skill.repoPath,
			installedPath: skill.installedPath,
			scope: skill.scope,
			commitSha: skill.commitSha,
			installed: true,
		};
	}
}

/**
 * Search for skill info from remote repos
 */
async function getRemoteSkillInfo(
	token: string,
	skillName: string,
	repos: RepoConfig[],
): Promise<SkillInfo | null> {
	for (const repoConfig of repos) {
		const { repo, branch, paths: searchPaths } = repoConfig;
		const basePaths = searchPaths.length > 0 ? searchPaths : [""];

		for (const basePath of basePaths) {
			try {
				const apiPath = basePath
					? `https://api.github.com/repos/${repo}/contents/${basePath}?ref=${branch}`
					: `https://api.github.com/repos/${repo}/contents?ref=${branch}`;

				const response = await fetch(apiPath, {
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
					},
				});

				if (!response.ok) continue;

				const contents = (await response.json()) as Array<{
					name: string;
					path: string;
					type: string;
				}>;

				const dirs = contents.filter(
					(item) =>
						item.type === "dir" &&
						item.name.toLowerCase() === skillName.toLowerCase(),
				);

				for (const dir of dirs) {
					const skillMdUrl = `https://api.github.com/repos/${repo}/contents/${dir.path}/SKILL.md?ref=${branch}`;
					const skillResponse = await fetch(skillMdUrl, {
						headers: {
							Authorization: `Bearer ${token}`,
							Accept: "application/vnd.github.raw+json",
							"X-GitHub-Api-Version": "2022-11-28",
						},
					});

					if (skillResponse.ok) {
						const content = await skillResponse.text();
						const frontmatter = parseFrontmatter(content);

						return {
							name: String(frontmatter.name || dir.name),
							description: String(frontmatter.description || ""),
							version: String(frontmatter.version || "1.0.0"),
							type: frontmatter.type ? String(frontmatter.type) : undefined,
							author: frontmatter.author
								? String(frontmatter.author)
								: undefined,
							tags: Array.isArray(frontmatter.tags)
								? frontmatter.tags.map(String)
								: undefined,
							repo,
							repoPath: dir.path,
							installed: false,
						};
					}
				}
			} catch {}
		}
	}

	return null;
}

export default function Info({ args: [skillName] }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<InfoState>({ phase: "checking" });

	useEffect(() => {
		async function loadInfo() {
			const credentials = await getCredentials();
			if (!credentials) {
				setState({ phase: "not_logged_in" });
				exit();
				return;
			}

			setState({ phase: "loading" });

			const config = getConfig();

			// First check if skill is installed
			const installedSkill = config.installed.find(
				(s) => s.name.toLowerCase() === skillName.toLowerCase(),
			);

			if (installedSkill) {
				const info = await getLocalSkillInfo(installedSkill);
				if (info) {
					setState({ phase: "success", info });
					exit();
					return;
				}
			}

			// Search in remote repos
			const remoteInfo = await getRemoteSkillInfo(
				credentials.token,
				skillName,
				config.repos,
			);

			if (remoteInfo) {
				setState({ phase: "success", info: remoteInfo });
			} else {
				setState({ phase: "not_found", skillName });
			}

			exit();
		}

		loadInfo().catch((err) => {
			setState({
				phase: "error",
				message:
					err instanceof Error ? err.message : "Failed to load skill info",
			});
			exit();
		});
	}, [skillName, exit]);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Initializing..." />;

		case "not_logged_in":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">Not authenticated</StatusMessage>
					<Text dimColor>Run 'skilluse login' to authenticate with GitHub</Text>
				</Box>
			);

		case "loading":
			return <Spinner text={`Loading info for "${skillName}"...`} />;

		case "not_found":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">
						Skill "{state.skillName}" not found
					</StatusMessage>
					<Box marginTop={1}>
						<Text dimColor>
							Try 'skilluse search {state.skillName}' to find available skills.
						</Text>
					</Box>
				</Box>
			);

		case "success": {
			const { info } = state;
			return (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color="cyan" bold>
							{info.name}
						</Text>
						<Text> v{info.version}</Text>
						{info.installed && <Text color="green"> (installed)</Text>}
					</Box>

					{info.description && (
						<Box marginBottom={1}>
							<Text>{info.description}</Text>
						</Box>
					)}

					<Box flexDirection="column" marginLeft={2}>
						{info.type && (
							<Box>
								<Text dimColor>Type: </Text>
								<Text>{info.type}</Text>
							</Box>
						)}

						{info.author && (
							<Box>
								<Text dimColor>Author: </Text>
								<Text>{info.author}</Text>
							</Box>
						)}

						<Box>
							<Text dimColor>Source: </Text>
							<Text>
								{info.repo}/{info.repoPath}
							</Text>
						</Box>

						{info.tags && info.tags.length > 0 && (
							<Box>
								<Text dimColor>Tags: </Text>
								<Text>{info.tags.join(", ")}</Text>
							</Box>
						)}

						{info.installed && info.scope && (
							<Box>
								<Text dimColor>Scope: </Text>
								<Text>{info.scope}</Text>
							</Box>
						)}

						{info.installed && info.installedPath && (
							<Box>
								<Text dimColor>Location: </Text>
								<Text>{info.installedPath}</Text>
							</Box>
						)}

						{info.installed && info.commitSha && (
							<Box>
								<Text dimColor>Commit: </Text>
								<Text>{info.commitSha.substring(0, 7)}</Text>
							</Box>
						)}
					</Box>

					{!info.installed && (
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse install {info.name}' to install this skill.
							</Text>
						</Box>
					)}
				</Box>
			);
		}

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
