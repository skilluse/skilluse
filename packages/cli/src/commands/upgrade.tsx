import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ProgressBar, Spinner, StatusMessage } from "../components/index.js";
import {
	addInstalledSkill,
	getConfig,
	getCredentials,
	type InstalledSkill,
	type RepoConfig,
} from "../services/index.js";

export const args = z.tuple([
	z
		.string()
		.optional()
		.describe("Skill name to upgrade (optional, upgrades all if omitted)"),
]);

export const options = z.object({});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

interface UpgradeInfo {
	skill: InstalledSkill;
	currentSha: string;
	latestSha: string;
	latestVersion: string;
}

type UpgradeState =
	| { phase: "checking" }
	| { phase: "not_logged_in" }
	| { phase: "not_found"; skillName: string }
	| { phase: "checking_updates"; current: number; total: number }
	| { phase: "no_updates" }
	| {
			phase: "upgrading";
			upgrades: UpgradeInfo[];
			current: number;
			progress: number;
	  }
	| { phase: "success"; upgraded: string[] }
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
		const value = line.substring(colonIndex + 1).trim();
		if (key) result[key] = value;
	}

	return result;
}

/**
 * Check if a skill has updates available
 */
async function checkForUpdate(
	token: string,
	skill: InstalledSkill,
	repoConfig: RepoConfig,
): Promise<UpgradeInfo | null> {
	const { repo, branch } = repoConfig;

	try {
		// Get latest commit SHA
		const refUrl = `https://api.github.com/repos/${repo}/commits/${branch}`;
		const refResponse = await fetch(refUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (!refResponse.ok) return null;

		const refData = (await refResponse.json()) as { sha: string };
		const latestSha = refData.sha;

		// If SHA matches, no update needed
		if (latestSha === skill.commitSha) {
			return null;
		}

		// Get latest version from SKILL.md
		const skillMdUrl = `https://api.github.com/repos/${repo}/contents/${skill.repoPath}/SKILL.md?ref=${branch}`;
		const skillResponse = await fetch(skillMdUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github.raw+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		let latestVersion = skill.version;
		if (skillResponse.ok) {
			const content = await skillResponse.text();
			const frontmatter = parseFrontmatter(content);
			if (frontmatter.version) {
				latestVersion = String(frontmatter.version);
			}
		}

		return {
			skill,
			currentSha: skill.commitSha,
			latestSha,
			latestVersion,
		};
	} catch {
		return null;
	}
}

interface GitHubTreeItem {
	path: string;
	type: "blob" | "tree";
	sha: string;
}

/**
 * Download all files from a skill directory
 */
async function downloadSkillFiles(
	token: string,
	repo: string,
	skillPath: string,
	branch: string,
	targetDir: string,
): Promise<void> {
	const treeUrl = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
	const treeResponse = await fetch(treeUrl, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});

	if (!treeResponse.ok) {
		throw new Error(`Failed to fetch repository tree: ${treeResponse.status}`);
	}

	const treeData = (await treeResponse.json()) as { tree: GitHubTreeItem[] };
	const skillFiles = treeData.tree.filter(
		(item) => item.type === "blob" && item.path.startsWith(`${skillPath}/`),
	);

	if (skillFiles.length === 0) {
		throw new Error(`No files found in skill directory: ${skillPath}`);
	}

	// Remove old files and recreate directory
	await rm(targetDir, { recursive: true, force: true });
	await mkdir(targetDir, { recursive: true });

	for (const file of skillFiles) {
		const relativePath = file.path.substring(skillPath.length + 1);
		const targetPath = join(targetDir, relativePath);
		const targetFileDir = join(
			targetDir,
			relativePath.split("/").slice(0, -1).join("/"),
		);

		if (targetFileDir !== targetDir) {
			await mkdir(targetFileDir, { recursive: true });
		}

		const fileUrl = `https://api.github.com/repos/${repo}/contents/${file.path}?ref=${branch}`;
		const fileResponse = await fetch(fileUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github.raw+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (!fileResponse.ok) {
			throw new Error(`Failed to download file: ${file.path}`);
		}

		const content = await fileResponse.text();
		await writeFile(targetPath, content, "utf-8");
	}
}

export default function Upgrade({ args: [skillName] }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<UpgradeState>({ phase: "checking" });

	useEffect(() => {
		async function upgrade() {
			const credentials = await getCredentials();
			if (!credentials) {
				setState({ phase: "not_logged_in" });
				exit();
				return;
			}

			const config = getConfig();

			// Determine which skills to check
			let skillsToCheck: InstalledSkill[] = [];

			if (skillName) {
				const skill = config.installed.find(
					(s) => s.name.toLowerCase() === skillName.toLowerCase(),
				);
				if (!skill) {
					setState({ phase: "not_found", skillName });
					exit();
					return;
				}
				skillsToCheck = [skill];
			} else {
				skillsToCheck = config.installed;
			}

			if (skillsToCheck.length === 0) {
				setState({ phase: "no_updates" });
				exit();
				return;
			}

			// Check for updates
			const upgrades: UpgradeInfo[] = [];

			for (let i = 0; i < skillsToCheck.length; i++) {
				setState({
					phase: "checking_updates",
					current: i + 1,
					total: skillsToCheck.length,
				});

				const skill = skillsToCheck[i];
				const repoConfig = config.repos.find((r) => r.repo === skill.repo);
				if (!repoConfig) continue;

				const update = await checkForUpdate(
					credentials.token,
					skill,
					repoConfig,
				);
				if (update) {
					upgrades.push(update);
				}
			}

			if (upgrades.length === 0) {
				setState({ phase: "no_updates" });
				exit();
				return;
			}

			// Perform upgrades
			const upgraded: string[] = [];

			for (let i = 0; i < upgrades.length; i++) {
				const { skill, latestSha, latestVersion } = upgrades[i];
				setState({
					phase: "upgrading",
					upgrades,
					current: i,
					progress: Math.round((i / upgrades.length) * 100),
				});

				try {
					const repoConfig = config.repos.find((r) => r.repo === skill.repo);
					if (!repoConfig) continue;

					// Download new files
					await downloadSkillFiles(
						credentials.token,
						skill.repo,
						skill.repoPath,
						repoConfig.branch,
						skill.installedPath,
					);

					// Update config
					const updatedSkill: InstalledSkill = {
						...skill,
						commitSha: latestSha,
						version: latestVersion,
					};
					addInstalledSkill(updatedSkill);

					upgraded.push(`${skill.name} -> v${latestVersion}`);
				} catch {
					// Skip failed upgrades
				}
			}

			if (upgraded.length > 0) {
				setState({ phase: "success", upgraded });
			} else {
				setState({ phase: "error", message: "All upgrades failed" });
			}

			exit();
		}

		upgrade().catch((err) => {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Upgrade failed",
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

		case "not_found":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">
						Skill "{state.skillName}" is not installed
					</StatusMessage>
					<Box marginTop={1}>
						<Text dimColor>Run 'skilluse list' to see installed skills.</Text>
					</Box>
				</Box>
			);

		case "checking_updates":
			return (
				<Spinner
					text={`Checking for updates (${state.current}/${state.total})...`}
				/>
			);

		case "no_updates":
			return (
				<StatusMessage type="success">All skills are up to date</StatusMessage>
			);

		case "upgrading":
			return (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>Upgrading skills...</Text>
					</Box>
					{state.upgrades.map((upgrade, i) => (
						<Box key={upgrade.skill.name}>
							<Text>
								{i < state.current && <Text color="green">[x]</Text>}
								{i === state.current && <Text color="yellow">[~]</Text>}
								{i > state.current && <Text dimColor>[ ]</Text>}
							</Text>
							<Text> {upgrade.skill.name}</Text>
							<Text dimColor>
								{" "}
								v{upgrade.skill.version} {"->"} v{upgrade.latestVersion}
							</Text>
						</Box>
					))}
					<Box marginTop={1}>
						<ProgressBar percent={state.progress} width={30} />
					</Box>
				</Box>
			);

		case "success":
			return (
				<Box flexDirection="column">
					<StatusMessage type="success">
						Upgraded {state.upgraded.length} skill(s)
					</StatusMessage>
					<Box flexDirection="column" marginLeft={2}>
						{state.upgraded.map((name) => (
							<Text key={name} dimColor>
								{name}
							</Text>
						))}
					</Box>
				</Box>
			);

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
