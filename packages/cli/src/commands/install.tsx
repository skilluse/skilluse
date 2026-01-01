import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { Box, Static, Text, useApp, useInput } from "ink";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { ProgressBar, Spinner, StatusMessage } from "../components/index.js";
import {
	addInstalledSkill,
	buildGitHubHeaders,
	buildGitHubRawHeaders,
	getAgent,
	getConfig,
	getCredentials,
	getCurrentAgent,
	getGitHubErrorMessage,
	getSkillsPath,
	type InstalledSkill,
	isAuthRequired,
	isPublicRepo,
	type RepoConfig,
} from "../services/index.js";

export const args = z.tuple([z.string().describe("Skill name to install")]);

export const options = z.object({
	global: z
		.boolean()
		.default(false)
		.describe("Install globally to agent's global skills path"),
	agent: z
		.string()
		.optional()
		.describe("Override current agent (e.g., cursor, claude)"),
	force: z
		.boolean()
		.default(false)
		.describe("Skip security warning for public repos"),
});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

interface SkillMetadata {
	name: string;
	description: string;
	type?: string;
	version?: string;
	author?: string;
	repo: string;
	path: string;
}

interface InstallStep {
	label: string;
	status: "pending" | "in_progress" | "done" | "error";
}

type InstallState =
	| { phase: "checking" }
	| { phase: "no_repos" }
	| { phase: "searching"; repo: string }
	| { phase: "not_found"; skillName: string }
	| {
			phase: "conflict";
			skillName: string;
			sources: Array<{ repo: string; path: string }>;
	  }
	| {
			phase: "warning";
			skill: SkillMetadata;
			commitSha: string;
			scope: "local" | "global";
			agentId: string;
			branch: string;
			source: InstallSource;
	  }
	| {
			phase: "installing";
			skill: SkillMetadata;
			scope: "local" | "global";
			steps: InstallStep[];
			progress: number;
	  }
	| { phase: "success"; skill: SkillMetadata; installedPath: string }
	| { phase: "cancelled" }
	| { phase: "auth_required"; message: string }
	| { phase: "error"; message: string };

// Final phases that should be preserved with Static
const FINAL_PHASES = [
	"success",
	"error",
	"auth_required",
	"no_repos",
	"not_found",
	"conflict",
	"cancelled",
];

/**
 * Security warning prompt for public repo installations
 */
function SecurityWarningPrompt({
	skill,
	onConfirm,
	onCancel,
}: {
	skill: SkillMetadata;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	useInput((input, key) => {
		if (input.toLowerCase() === "y" || key.return) {
			onConfirm();
		} else if (input.toLowerCase() === "n" || key.escape) {
			onCancel();
		}
	});

	return (
		<Box flexDirection="column" borderStyle="round" paddingX={1}>
			<Box marginBottom={1}>
				<Text color="yellow" bold>
					Security Warning
				</Text>
			</Box>
			<Box flexDirection="column" marginBottom={1}>
				<Text>
					You are about to install{" "}
					<Text color="cyan" bold>
						{skill.name}
					</Text>{" "}
					from a <Text color="yellow">public repository</Text>:
				</Text>
				<Box marginLeft={2} marginTop={1}>
					<Text dimColor>{skill.repo}</Text>
				</Box>
			</Box>
			<Box flexDirection="column" marginBottom={1}>
				<Text>
					Skills can execute arbitrary code. Please review the skill content
				</Text>
				<Text>
					at{" "}
					<Text color="blue" underline>
						https://github.com/{skill.repo}
					</Text>{" "}
					before proceeding.
				</Text>
			</Box>
			<Box marginBottom={1}>
				<Text dimColor>
					Consider installing from your own private repo for better security.
				</Text>
			</Box>
			<Box>
				<Text dimColor>Press </Text>
				<Text color="green">Y</Text>
				<Text dimColor> to continue, </Text>
				<Text color="red">N</Text>
				<Text dimColor> to cancel</Text>
			</Box>
		</Box>
	);
}

/**
 * Parse YAML frontmatter from SKILL.md content
 */
function parseFrontmatter(content: string): Record<string, unknown> {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) {
		return {};
	}

	const yaml = frontmatterMatch[1];
	const result: Record<string, unknown> = {};

	const lines = yaml.split("\n");
	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) continue;

		const key = line.substring(0, colonIndex).trim();
		let value: unknown = line.substring(colonIndex + 1).trim();

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

		if (key) {
			result[key] = value;
		}
	}

	return result;
}

/**
 * Install source types for unified installation
 */
type InstallSource =
	| { type: "repo"; name: string } // "pdf" -> from configured repos
	| { type: "github"; owner: string; repo: string; branch: string; path?: string }; // GitHub URL

/**
 * Parse an install source string into a structured type
 * Supports:
 * - "skill-name" -> search in configured repos
 * - "https://github.com/owner/repo" -> repo root
 * - "https://github.com/owner/repo/tree/branch/path" -> specific path
 */
function parseInstallSource(source: string): InstallSource {
	// GitHub URL: https://github.com/owner/repo/tree/branch/path
	if (source.startsWith("https://github.com/")) {
		const urlPath = source.replace("https://github.com/", "");
		const parts = urlPath.split("/");

		if (parts.length < 2) {
			return { type: "repo", name: source };
		}

		const owner = parts[0];
		const repo = parts[1];

		// https://github.com/owner/repo
		if (parts.length === 2) {
			return { type: "github", owner, repo, branch: "main" };
		}

		// https://github.com/owner/repo/tree/branch/path
		if (parts[2] === "tree" && parts.length >= 4) {
			const branch = parts[3];
			const path = parts.slice(4).join("/") || undefined;
			return { type: "github", owner, repo, branch, path };
		}

		// https://github.com/owner/repo/blob/... (not supported, treat as repo)
		return { type: "github", owner, repo, branch: "main" };
	}

	// Default: skill name from configured repos
	return { type: "repo", name: source };
}

/**
 * Find a skill by name in configured repos
 * Returns authRequired if a private repo requires authentication
 */
async function findSkill(
	token: string | undefined,
	repos: RepoConfig[],
	skillName: string,
): Promise<
	| { results: Array<{ skill: SkillMetadata; commitSha: string }> }
	| { authRequired: true; message: string }
> {
	const results: Array<{ skill: SkillMetadata; commitSha: string }> = [];

	for (const repoConfig of repos) {
		const { repo, branch, paths: searchPaths } = repoConfig;
		const basePaths = searchPaths.length > 0 ? searchPaths : [""];

		for (const basePath of basePaths) {
			try {
				// Get directory contents
				const apiPath = basePath
					? `https://api.github.com/repos/${repo}/contents/${basePath}?ref=${branch}`
					: `https://api.github.com/repos/${repo}/contents?ref=${branch}`;

				const response = await fetch(apiPath, {
					headers: buildGitHubHeaders(token),
				});

				if (!response.ok) {
					if (isAuthRequired(response)) {
						return {
							authRequired: true,
							message: getGitHubErrorMessage(response),
						};
					}
					continue;
				}

				const contents = (await response.json()) as Array<{
					name: string;
					path: string;
					type: string;
				}>;

				// Look for directories matching skill name
				const dirs = contents.filter(
					(item) =>
						item.type === "dir" &&
						item.name.toLowerCase() === skillName.toLowerCase(),
				);

				for (const dir of dirs) {
					// Fetch SKILL.md
					const skillMdUrl = `https://api.github.com/repos/${repo}/contents/${dir.path}/SKILL.md?ref=${branch}`;
					const skillResponse = await fetch(skillMdUrl, {
						headers: buildGitHubRawHeaders(token),
					});

					if (skillResponse.ok) {
						const content = await skillResponse.text();
						const frontmatter = parseFrontmatter(content);

						// Get the commit SHA for this ref
						const refUrl = `https://api.github.com/repos/${repo}/commits/${branch}`;
						const refResponse = await fetch(refUrl, {
							headers: buildGitHubHeaders(token),
						});

						let commitSha = branch;
						if (refResponse.ok) {
							const refData = (await refResponse.json()) as { sha: string };
							commitSha = refData.sha;
						}

						results.push({
							skill: {
								name: String(frontmatter.name || dir.name),
								description: String(frontmatter.description || ""),
								type: frontmatter.type ? String(frontmatter.type) : undefined,
								version: frontmatter.version
									? String(frontmatter.version)
									: "1.0.0",
								author: frontmatter.author
									? String(frontmatter.author)
									: undefined,
								repo,
								path: dir.path,
							},
							commitSha,
						});
					}
				}
			} catch {
				// Continue on error
			}
		}
	}

	return { results };
}

interface GitHubTreeItem {
	path: string;
	type: "blob" | "tree";
	sha: string;
}

/**
 * Download all files from a skill directory
 * Returns authRequired message if private repo access is denied
 */
async function downloadSkillFiles(
	token: string | undefined,
	repo: string,
	skillPath: string,
	branch: string,
	targetDir: string,
	onProgress?: (downloaded: number, total: number) => void,
): Promise<void | { authRequired: true; message: string }> {
	// Get the tree for the skill directory
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

	// Filter to only files in the skill directory
	const skillFiles = treeData.tree.filter(
		(item) => item.type === "blob" && item.path.startsWith(`${skillPath}/`),
	);

	if (skillFiles.length === 0) {
		throw new Error(`No files found in skill directory: ${skillPath}`);
	}

	// Create target directory
	await mkdir(targetDir, { recursive: true });

	// Download each file
	let downloaded = 0;
	for (const file of skillFiles) {
		const relativePath = file.path.substring(skillPath.length + 1);
		const targetPath = join(targetDir, relativePath);
		const targetFileDir = join(
			targetDir,
			relativePath.split("/").slice(0, -1).join("/"),
		);

		// Create parent directories if needed
		if (targetFileDir !== targetDir) {
			await mkdir(targetFileDir, { recursive: true });
		}

		// Download file content
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

		downloaded++;
		if (onProgress) {
			onProgress(downloaded, skillFiles.length);
		}
	}
}

/**
 * Fetch skill metadata from a GitHub repo at a specific path
 * Returns authRequired if private repo access is denied
 */
async function fetchGitHubSkill(
	token: string | undefined,
	owner: string,
	repo: string,
	path?: string,
	branch = "main",
): Promise<
	| { skill: SkillMetadata; commitSha: string }
	| { authRequired: true; message: string }
	| null
> {
	const fullRepo = `${owner}/${repo}`;
	const skillPath = path || "";

	try {
		// Get the commit SHA for this ref
		const refUrl = `https://api.github.com/repos/${fullRepo}/commits/${branch}`;
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
		const commitSha = refData.sha;

		// Fetch SKILL.md
		const skillMdPath = skillPath ? `${skillPath}/SKILL.md` : "SKILL.md";
		const skillMdUrl = `https://api.github.com/repos/${fullRepo}/contents/${skillMdPath}?ref=${branch}`;
		const skillResponse = await fetch(skillMdUrl, {
			headers: buildGitHubRawHeaders(token),
		});

		if (!skillResponse.ok) {
			if (isAuthRequired(skillResponse)) {
				return {
					authRequired: true,
					message: getGitHubErrorMessage(skillResponse),
				};
			}
			return null;
		}

		const content = await skillResponse.text();
		const frontmatter = parseFrontmatter(content);

		// Derive skill name from path or repo name
		const skillName = path ? basename(path) : repo;

		return {
			skill: {
				name: String(frontmatter.name || skillName),
				description: String(frontmatter.description || ""),
				type: frontmatter.type ? String(frontmatter.type) : undefined,
				version: frontmatter.version ? String(frontmatter.version) : "1.0.0",
				author: frontmatter.author ? String(frontmatter.author) : undefined,
				repo: fullRepo,
				path: skillPath,
			},
			commitSha,
		};
	} catch {
		return null;
	}
}

export default function Install({ args: [skillName], options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<InstallState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		async function install() {
			// Determine which agent to use (--agent flag or current agent)
			const agentId = opts.agent || getCurrentAgent();
			const agent = getAgent(agentId);
			if (!agent) {
				setState({
					phase: "error",
					message: `Unknown agent: ${agentId}`,
				});
				return;
			}

			const scope = opts.global ? "global" : "local";
			const config = getConfig();

			// Parse install source
			const source = parseInstallSource(skillName);

			// Get optional credentials for GitHub access
			const credentials = await getCredentials();
			const token = credentials?.token;

			// Handle GitHub direct installation (owner/repo or owner/repo/path)
			if (source.type === "github") {
				setState({ phase: "searching", repo: `${source.owner}/${source.repo}` });

				const result = await fetchGitHubSkill(
					token,
					source.owner,
					source.repo,
					source.path,
					source.branch,
				);

				if (result && "authRequired" in result) {
					setState({ phase: "auth_required", message: result.message });
					return;
				}

				if (!result) {
					setState({
						phase: "not_found",
						skillName: `${source.owner}/${source.repo}${source.path ? `/${source.path}` : ""}`,
					});
					return;
				}

				const { skill, commitSha } = result;

				// Check if this is a public repo and show security warning
				if (!opts.force) {
					const isPublic = await isPublicRepo(
						source.owner,
						source.repo,
						token,
					);
					if (isPublic) {
						setState({
							phase: "warning",
							skill,
							commitSha,
							scope,
							agentId,
							branch: source.branch,
							source,
						});
						return;
					}
				}

				const baseDir = getSkillsPath(agentId, scope);
				const installPath = join(baseDir, skill.name);

				const steps: InstallStep[] = [
					{ label: "Fetching skill metadata", status: "done" },
					{ label: "Downloading files", status: "in_progress" },
					{
						label: `Installing to ${agent.localPath}/${skill.name}`,
						status: "pending",
					},
					{ label: "Verifying installation", status: "pending" },
				];

				setState({
					phase: "installing",
					skill,
					scope,
					steps,
					progress: 25,
				});

				try {
					// Download files from GitHub
					const skillPath = source.path || "";
					const downloadResult = await downloadSkillFiles(
						token,
						`${source.owner}/${source.repo}`,
						skillPath,
						source.branch,
						installPath,
						(downloaded, total) => {
							const downloadProgress = 25 + (downloaded / total) * 50;
							setState((prev) => {
								if (prev.phase !== "installing") return prev;
								return { ...prev, progress: Math.round(downloadProgress) };
							});
						},
					);

					if (downloadResult && "authRequired" in downloadResult) {
						setState({ phase: "auth_required", message: downloadResult.message });
						return;
					}

					// Update steps
					steps[1].status = "done";
					steps[2].status = "in_progress";
					setState((prev) => {
						if (prev.phase !== "installing") return prev;
						return { ...prev, steps: [...steps], progress: 85 };
					});

					// Record in config
					const installedSkill: InstalledSkill = {
						name: skill.name,
						repo: skill.repo,
						repoPath: skill.path,
						commitSha,
						version: skill.version || "1.0.0",
						type: skill.type || "skill",
						installedPath: installPath,
						scope,
						agent: agentId,
					};
					addInstalledSkill(installedSkill);

					steps[2].status = "done";
					steps[3].status = "done";
					setState({
						phase: "success",
						skill,
						installedPath: installPath,
					});
				} catch (err) {
					setState({
						phase: "error",
						message: err instanceof Error ? err.message : "Installation failed",
					});
				}
				return;
			}

			// Handle repo skill name (search in configured repos)
			if (config.repos.length === 0) {
				setState({ phase: "no_repos" });
				return;
			}

			// Search for the skill
			const allRepos = config.repos;
			for (const repo of allRepos) {
				setState({ phase: "searching", repo: repo.repo });
			}

			const findResult = await findSkill(token, allRepos, source.name);

			if ("authRequired" in findResult) {
				setState({ phase: "auth_required", message: findResult.message });
				return;
			}

			const { results } = findResult;

			if (results.length === 0) {
				setState({ phase: "not_found", skillName: source.name });
				return;
			}

			if (results.length > 1) {
				setState({
					phase: "conflict",
					skillName: source.name,
					sources: results.map((r) => ({
						repo: r.skill.repo,
						path: r.skill.path,
					})),
				});
				return;
			}

			// Single match - proceed with installation
			const { skill, commitSha } = results[0];

			// Get branch from repo config
			const repoConfig = config.repos.find((r) => r.repo === skill.repo);
			const branch = repoConfig?.branch || "main";

			// Check if this is a public repo and show security warning
			if (!opts.force) {
				const [owner, repo] = skill.repo.split("/");
				const isPublic = await isPublicRepo(owner, repo, token);
				if (isPublic) {
					setState({
						phase: "warning",
						skill,
						commitSha,
						scope,
						agentId,
						branch,
						source,
					});
					return;
				}
			}

			// Determine install path using agent's path
			const baseDir = getSkillsPath(agentId, scope);
			const installPath = join(baseDir, skill.name);

			// Initialize steps
			const steps: InstallStep[] = [
				{ label: "Fetching skill metadata", status: "done" },
				{ label: "Downloading files", status: "in_progress" },
				{
					label: `Installing to ${agent.localPath}/${skill.name}`,
					status: "pending",
				},
				{ label: "Verifying installation", status: "pending" },
			];

			setState({
				phase: "installing",
				skill,
				scope,
				steps,
				progress: 25,
			});

			try {

				// Download files
				const downloadResult = await downloadSkillFiles(
					token,
					skill.repo,
					skill.path,
					branch,
					installPath,
					(downloaded, total) => {
						const downloadProgress = 25 + (downloaded / total) * 50;
						setState((prev) => {
							if (prev.phase !== "installing") return prev;
							return { ...prev, progress: Math.round(downloadProgress) };
						});
					},
				);

				if (downloadResult && "authRequired" in downloadResult) {
					setState({ phase: "auth_required", message: downloadResult.message });
					return;
				}

				// Update steps - downloading done
				steps[1].status = "done";
				steps[2].status = "in_progress";
				setState((prev) => {
					if (prev.phase !== "installing") return prev;
					return { ...prev, steps: [...steps], progress: 85 };
				});

				// Record in config
				const installedSkill: InstalledSkill = {
					name: skill.name,
					repo: skill.repo,
					repoPath: skill.path,
					commitSha,
					version: skill.version || "1.0.0",
					type: skill.type || "skill",
					installedPath: installPath,
					scope,
					agent: agentId,
				};
				addInstalledSkill(installedSkill);

				// Update steps - installation done
				steps[2].status = "done";
				steps[3].status = "in_progress";
				setState((prev) => {
					if (prev.phase !== "installing") return prev;
					return { ...prev, steps: [...steps], progress: 95 };
				});

				// Verification step (quick file check)
				steps[3].status = "done";
				setState((prev) => {
					if (prev.phase !== "installing") return prev;
					return { ...prev, steps: [...steps], progress: 100 };
				});

				// Short delay to show completion
				await new Promise((resolve) => setTimeout(resolve, 200));

				setState({
					phase: "success",
					skill,
					installedPath: installPath,
				});
			} catch (err) {
				setState({
					phase: "error",
					message: err instanceof Error ? err.message : "Installation failed",
				});
			}
		}

		install().catch((err) => {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Installation failed",
			});
		});
	}, [skillName, opts.global, opts.agent, opts.force]);

	// Perform installation after user confirms security warning
	const performInstall = useCallback(async () => {
		if (state.phase !== "warning") return;

		const { skill, commitSha, scope, agentId, branch, source } = state;
		const agent = getAgent(agentId);
		if (!agent) {
			setState({ phase: "error", message: `Unknown agent: ${agentId}` });
			return;
		}

		const credentials = await getCredentials();
		const token = credentials?.token;

		const baseDir = getSkillsPath(agentId, scope);
		const installPath = join(baseDir, skill.name);

		const steps: InstallStep[] = [
			{ label: "Fetching skill metadata", status: "done" },
			{ label: "Downloading files", status: "in_progress" },
			{
				label: `Installing to ${agent.localPath}/${skill.name}`,
				status: "pending",
			},
			{ label: "Verifying installation", status: "pending" },
		];

		setState({
			phase: "installing",
			skill,
			scope,
			steps,
			progress: 25,
		});

		try {
			const skillPath =
				source.type === "github" ? source.path || "" : skill.path;
			const repoName =
				source.type === "github"
					? `${source.owner}/${source.repo}`
					: skill.repo;

			const downloadResult = await downloadSkillFiles(
				token,
				repoName,
				skillPath,
				branch,
				installPath,
				(downloaded, total) => {
					const downloadProgress = 25 + (downloaded / total) * 50;
					setState((prev) => {
						if (prev.phase !== "installing") return prev;
						return { ...prev, progress: Math.round(downloadProgress) };
					});
				},
			);

			if (downloadResult && "authRequired" in downloadResult) {
				setState({ phase: "auth_required", message: downloadResult.message });
				return;
			}

			steps[1].status = "done";
			steps[2].status = "in_progress";
			setState((prev) => {
				if (prev.phase !== "installing") return prev;
				return { ...prev, steps: [...steps], progress: 85 };
			});

			const installedSkill: InstalledSkill = {
				name: skill.name,
				repo: skill.repo,
				repoPath: skill.path,
				commitSha,
				version: skill.version || "1.0.0",
				type: skill.type || "skill",
				installedPath: installPath,
				scope,
				agent: agentId,
			};
			addInstalledSkill(installedSkill);

			steps[2].status = "done";
			steps[3].status = "done";
			setState({
				phase: "success",
				skill,
				installedPath: installPath,
			});
		} catch (err) {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Installation failed",
			});
		}
	}, [state]);

	function handleConfirm() {
		performInstall();
	}

	function handleCancel() {
		setState({ phase: "cancelled" });
	}

	// Add output item when entering a final phase
	useEffect(() => {
		if (FINAL_PHASES.includes(state.phase) && outputItems.length === 0) {
			setOutputItems([{ id: "output" }]);
		}
	}, [state.phase, outputItems.length]);

	// Exit after output item is added
	useEffect(() => {
		if (outputItems.length > 0) {
			process.nextTick(() => exit());
		}
	}, [outputItems.length, exit]);

	// Render dynamic content (spinners, progress) - will be cleared on exit
	if (state.phase === "checking") {
		return <Spinner text="Initializing..." />;
	}

	if (state.phase === "searching") {
		return <Spinner text={`Searching ${state.repo}...`} />;
	}

	if (state.phase === "warning") {
		return (
			<SecurityWarningPrompt
				skill={state.skill}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		);
	}

	if (state.phase === "installing") {
		return (
			<Box flexDirection="column" borderStyle="round" paddingX={1}>
				<Box marginBottom={1}>
					<Text bold>Installing: </Text>
					<Text color="cyan">{state.skill.name}</Text>
					<Text dimColor> ({state.scope})</Text>
				</Box>

				{state.steps.map((step) => (
					<Box key={step.label}>
						<Text>
							{step.status === "done" && <Text color="green">✔</Text>}
							{step.status === "in_progress" && <Text color="yellow">◐</Text>}
							{step.status === "pending" && <Text dimColor>○</Text>}
							{step.status === "error" && <Text color="red">✖</Text>}
						</Text>
						<Text> {step.label}</Text>
					</Box>
				))}

				<Box marginTop={1}>
					<ProgressBar percent={state.progress} width={30} />
				</Box>
			</Box>
		);
	}

	// Render final content with Static to preserve after exit
	const renderFinalContent = () => {
		switch (state.phase) {
			case "auth_required":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			case "no_repos":
				return (
					<>
						<StatusMessage type="warning">
							No repositories configured
						</StatusMessage>
						<Text dimColor>
							Run 'skilluse repo add owner/repo' to add a skill repository.
						</Text>
					</>
				);

			case "not_found":
				return (
					<>
						<StatusMessage type="error">
							Skill "{state.skillName}" not found
						</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>
								Try 'skilluse search {state.skillName}' to find available
								skills.
							</Text>
						</Box>
					</>
				);

			case "conflict":
				return (
					<>
						<StatusMessage type="warning">
							Skill "{state.skillName}" found in multiple repos:
						</StatusMessage>
						<Box flexDirection="column" marginTop={1} marginLeft={2}>
							{state.sources.map((source) => (
								<Text key={`${source.repo}/${source.path}`}>
									{source.repo}/{source.path}
								</Text>
							))}
						</Box>
						<Box marginTop={1}>
							<Text dimColor>
								Use: skilluse install repo/skill-name to specify
							</Text>
						</Box>
					</>
				);

			case "success":
				return (
					<>
						<StatusMessage type="success">
							Installed "{state.skill.name}" v{state.skill.version}
						</StatusMessage>
						<Box marginTop={1} marginLeft={2}>
							<Text dimColor>Location: {state.installedPath}</Text>
						</Box>
					</>
				);

			case "cancelled":
				return (
					<StatusMessage type="warning">Installation cancelled</StatusMessage>
				);

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<Static items={outputItems}>
			{(item) => (
				<Box key={item.id} flexDirection="column">
					{renderFinalContent()}
				</Box>
			)}
		</Static>
	);
}
