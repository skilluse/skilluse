import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ProgressBar, Spinner, StatusMessage } from "../components/index.js";
import {
	addInstalledSkill,
	buildGitHubHeaders,
	buildGitHubRawHeaders,
	getConfig,
	getCredentials,
	getGitHubErrorMessage,
	type InstalledSkill,
	isAuthRequired,
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
}

type UpgradeState =
	| { phase: "checking" }
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
	| { phase: "auth_required"; message: string }
	| { phase: "error"; message: string };

/**
 * Check if a skill has updates available
 * Returns authRequired if private repo access is denied
 */
async function checkForUpdate(
	token: string | undefined,
	skill: InstalledSkill,
	repoConfig: RepoConfig,
): Promise<UpgradeInfo | { authRequired: true; message: string } | null> {
	const { repo, branch } = repoConfig;

	try {
		// Get latest commit SHA
		const refUrl = `https://api.github.com/repos/${repo}/commits/${branch}`;
		const refResponse = await fetch(refUrl, {
			headers: buildGitHubHeaders(token),
		});

		if (!refResponse.ok) {
			if (isAuthRequired(refResponse)) {
				return {
					authRequired: true,
					message: getGitHubErrorMessage(refResponse),
				};
			}
			return null;
		}

		const refData = (await refResponse.json()) as { sha: string };
		const latestSha = refData.sha;

		// If SHA matches, no update needed
		if (latestSha === skill.commitSha) {
			return null;
		}

		return {
			skill,
			currentSha: skill.commitSha,
			latestSha,
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
 * Returns authRequired if private repo access is denied
 */
async function downloadSkillFiles(
	token: string | undefined,
	repo: string,
	skillPath: string,
	branch: string,
	targetDir: string,
): Promise<void | { authRequired: true; message: string }> {
	const treeUrl = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
	const treeResponse = await fetch(treeUrl, {
		headers: buildGitHubHeaders(token),
	});

	if (!treeResponse.ok) {
		if (isAuthRequired(treeResponse)) {
			return {
				authRequired: true,
				message: getGitHubErrorMessage(treeResponse),
			};
		}
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
			headers: buildGitHubRawHeaders(token),
		});

		if (!fileResponse.ok) {
			if (isAuthRequired(fileResponse)) {
				return {
					authRequired: true,
					message: getGitHubErrorMessage(fileResponse),
				};
			}
			throw new Error(`Failed to download file: ${file.path}`);
		}

		const content = await fileResponse.text();
		await writeFile(targetPath, content, "utf-8");
	}
}

export default function Upgrade({ args: [skillName] }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<UpgradeState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		async function upgrade() {
			const config = getConfig();

			// Determine which skills to check
			let skillsToCheck: InstalledSkill[] = [];

			if (skillName) {
				const skill = config.installed.find(
					(s) => s.name.toLowerCase() === skillName.toLowerCase(),
				);
				if (!skill) {
					setState({ phase: "not_found", skillName });
					return;
				}
				skillsToCheck = [skill];
			} else {
				skillsToCheck = config.installed;
			}

			if (skillsToCheck.length === 0) {
				setState({ phase: "no_updates" });
				return;
			}

			// Get optional credentials
			const credentials = await getCredentials();
			const token = credentials?.token;

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

				const result = await checkForUpdate(token, skill, repoConfig);

				if (result && "authRequired" in result) {
					setState({ phase: "auth_required", message: result.message });
					return;
				}

				if (result) {
					upgrades.push(result);
				}
			}

			if (upgrades.length === 0) {
				setState({ phase: "no_updates" });
				return;
			}

			// Perform upgrades
			const upgraded: string[] = [];

			for (let i = 0; i < upgrades.length; i++) {
				const { skill, latestSha } = upgrades[i];
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
					const downloadResult = await downloadSkillFiles(
						token,
						skill.repo,
						skill.repoPath,
						repoConfig.branch,
						skill.installedPath,
					);

					if (downloadResult && "authRequired" in downloadResult) {
						setState({
							phase: "auth_required",
							message: downloadResult.message,
						});
						return;
					}

					// Update config
					const updatedSkill: InstalledSkill = {
						...skill,
						commitSha: latestSha,
					};
					addInstalledSkill(updatedSkill);

					upgraded.push(skill.name);
				} catch {
					// Skip failed upgrades
				}
			}

			if (upgraded.length > 0) {
				setState({ phase: "success", upgraded });
			} else {
				setState({ phase: "error", message: "All upgrades failed" });
			}
		}

		upgrade().catch((err) => {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Upgrade failed",
			});
		});
	}, [skillName]);

	// Add output item when state is final
	useEffect(() => {
		const isFinalState =
			state.phase === "not_found" ||
			state.phase === "no_updates" ||
			state.phase === "success" ||
			state.phase === "auth_required" ||
			state.phase === "error";

		if (isFinalState && outputItems.length === 0) {
			setOutputItems([{ id: "output" }]);
		}
	}, [state.phase, outputItems.length]);

	// Exit after output item is rendered
	useEffect(() => {
		if (outputItems.length > 0) {
			process.nextTick(() => exit());
		}
	}, [outputItems.length, exit]);

	const renderContent = () => {
		switch (state.phase) {
			case "auth_required":
				return (
					<Box flexDirection="column">
						<StatusMessage type="error">{state.message}</StatusMessage>
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

			case "no_updates":
				return (
					<StatusMessage type="success">All skills are up to date</StatusMessage>
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

			default:
				return null;
		}
	};

	return (
		<>
			{state.phase === "checking" && <Spinner text="Initializing..." />}
			{state.phase === "checking_updates" && (
				<Spinner
					text={`Checking for updates (${state.current}/${state.total})...`}
				/>
			)}
			{state.phase === "upgrading" && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>Upgrading skills...</Text>
					</Box>
					{state.upgrades.map((upgrade, i) => (
						<Box key={upgrade.skill.name}>
							<Text>
								{i < state.current && <Text color="green">✔</Text>}
								{i === state.current && <Text color="yellow">◐</Text>}
								{i > state.current && <Text dimColor>○</Text>}
							</Text>
							<Text> {upgrade.skill.name}</Text>
						</Box>
					))}
					<Box marginTop={1}>
						<ProgressBar percent={state.progress} width={30} />
					</Box>
				</Box>
			)}
			<Static items={outputItems}>
				{(item) => (
					<Box key={item.id} flexDirection="column">
						{renderContent()}
					</Box>
				)}
			</Static>
		</>
	);
}
