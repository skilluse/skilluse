import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Box, Static, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	buildGitHubHeaders,
	getAgent,
	getConfig,
	getCredentials,
	getCurrentAgent,
	getSkillsPath,
} from "../services/index.js";

export const args = z.tuple([z.string().describe("Skill name to publish")]);

export const options = z.object({});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type PublishState =
	| { phase: "checking" }
	| { phase: "no_default_repo" }
	| { phase: "skill_not_found"; skillName: string; searchPath: string }
	| { phase: "missing_skill_md"; skillPath: string }
	| { phase: "invalid_frontmatter"; field: string }
	| { phase: "auth_required" }
	| { phase: "no_write_access"; repo: string }
	| { phase: "repo_not_found"; repo: string }
	| {
			phase: "exists_prompt";
			skillName: string;
			repo: string;
			path: string;
	  }
	| {
			phase: "uploading";
			skillName: string;
			progress: number;
			currentFile: string;
	  }
	| { phase: "success"; skillName: string; githubUrl: string }
	| { phase: "cancelled" }
	| { phase: "error"; message: string };

const FINAL_PHASES = [
	"success",
	"error",
	"no_default_repo",
	"skill_not_found",
	"missing_skill_md",
	"invalid_frontmatter",
	"auth_required",
	"no_write_access",
	"repo_not_found",
	"cancelled",
];

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

		if (key) {
			result[key] = value;
		}
	}

	return result;
}

/**
 * Get all files in a directory recursively
 */
async function getFilesRecursively(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			const subFiles = await getFilesRecursively(fullPath);
			files.push(...subFiles);
		} else {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Check if a skill exists in the remote repo
 */
async function checkSkillExists(
	token: string,
	repo: string,
	skillPath: string,
	branch: string,
): Promise<boolean> {
	try {
		const response = await fetch(
			`https://api.github.com/repos/${repo}/contents/${skillPath}?ref=${branch}`,
			{ headers: buildGitHubHeaders(token) },
		);
		return response.ok;
	} catch {
		return false;
	}
}

/**
 * Upload a file to GitHub using the Contents API
 */
async function uploadFile(
	token: string,
	repo: string,
	path: string,
	content: string,
	branch: string,
	existingSha?: string,
): Promise<{ success: boolean; message?: string; noAccess?: boolean; notFound?: boolean }> {
	const url = `https://api.github.com/repos/${repo}/contents/${path}`;

	const body: Record<string, string> = {
		message: `Add ${path} via skilluse`,
		content: Buffer.from(content).toString("base64"),
		branch,
	};

	if (existingSha) {
		body.sha = existingSha;
	}

	try {
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				...buildGitHubHeaders(token),
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (response.status === 403 || response.status === 401) {
			return { success: false, noAccess: true };
		}

		if (response.status === 404) {
			return { success: false, notFound: true };
		}

		if (!response.ok) {
			const data = (await response.json()) as { message?: string };
			return { success: false, message: data.message || `HTTP ${response.status}` };
		}

		return { success: true };
	} catch (err) {
		return {
			success: false,
			message: err instanceof Error ? err.message : "Upload failed",
		};
	}
}

/**
 * Get SHA of an existing file (needed for updates)
 */
async function getFileSha(
	token: string,
	repo: string,
	path: string,
	branch: string,
): Promise<string | undefined> {
	try {
		const response = await fetch(
			`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
			{ headers: buildGitHubHeaders(token) },
		);

		if (response.ok) {
			const data = (await response.json()) as { sha: string };
			return data.sha;
		}
	} catch {
		// File doesn't exist
	}
	return undefined;
}

/**
 * Overwrite confirmation prompt
 */
function OverwritePrompt({
	skillName,
	repo,
	onConfirm,
	onCancel,
}: {
	skillName: string;
	repo: string;
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
					Skill Already Exists
				</Text>
			</Box>
			<Box flexDirection="column" marginBottom={1}>
				<Text>
					Skill{" "}
					<Text color="cyan" bold>
						{skillName}
					</Text>{" "}
					already exists in repository:
				</Text>
				<Box marginLeft={2} marginTop={1}>
					<Text dimColor>{repo}</Text>
				</Box>
			</Box>
			<Box>
				<Text dimColor>Press </Text>
				<Text color="green">Y</Text>
				<Text dimColor> to overwrite, </Text>
				<Text color="red">N</Text>
				<Text dimColor> to cancel</Text>
			</Box>
		</Box>
	);
}

export default function Publish({ args: [skillName] }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<PublishState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);
	const [publishContext, setPublishContext] = useState<{
		skillPath: string;
		repoConfig: { repo: string; branch: string; paths: string[] };
		token: string;
	} | null>(null);

	useEffect(() => {
		async function validate() {
			// Check for credentials
			const credentials = await getCredentials();
			if (!credentials?.token) {
				setState({ phase: "auth_required" });
				return;
			}

			const config = getConfig();

			// F004: Check default repo is set
			if (!config.defaultRepo) {
				setState({ phase: "no_default_repo" });
				return;
			}

			const repoConfig = config.repos.find((r) => r.repo === config.defaultRepo);
			if (!repoConfig) {
				setState({ phase: "no_default_repo" });
				return;
			}

			// Get skill path from current agent
			const agentId = getCurrentAgent();
			const agent = getAgent(agentId);
			if (!agent) {
				setState({ phase: "error", message: `Unknown agent: ${agentId}` });
				return;
			}

			const skillsDir = getSkillsPath(agentId, "local");
			const skillPath = join(skillsDir, skillName);

			// F001: Validate skill directory exists
			if (!existsSync(skillPath)) {
				setState({
					phase: "skill_not_found",
					skillName,
					searchPath: skillsDir,
				});
				return;
			}

			// F002: Validate SKILL.md exists
			const skillMdPath = join(skillPath, "SKILL.md");
			if (!existsSync(skillMdPath)) {
				setState({ phase: "missing_skill_md", skillPath });
				return;
			}

			// F003: Validate SKILL.md has required frontmatter
			const skillMdContent = await readFile(skillMdPath, "utf-8");
			const frontmatter = parseFrontmatter(skillMdContent);

			if (!frontmatter.name) {
				setState({ phase: "invalid_frontmatter", field: "name" });
				return;
			}
			if (!frontmatter.description) {
				setState({ phase: "invalid_frontmatter", field: "description" });
				return;
			}

			// Save context for potential overwrite
			setPublishContext({
				skillPath,
				repoConfig,
				token: credentials.token,
			});

			// Check if skill already exists in repo
			// Handle "." path as root (skill at root level)
			const basePath = repoConfig.paths.length > 0 ? repoConfig.paths[0] : "";
			const targetPath =
				basePath && basePath !== "." ? `${basePath}/${skillName}` : skillName;

			const exists = await checkSkillExists(
				credentials.token,
				repoConfig.repo,
				targetPath,
				repoConfig.branch,
			);

			if (exists) {
				// F007: Prompt when skill exists
				setState({
					phase: "exists_prompt",
					skillName,
					repo: repoConfig.repo,
					path: targetPath,
				});
				return;
			}

			// Proceed with upload
			await performUpload(
				skillPath,
				repoConfig,
				credentials.token,
				skillName,
				targetPath,
			);
		}

		validate().catch((err) => {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Publish failed",
			});
		});
	}, [skillName]);

	async function performUpload(
		skillPath: string,
		repoConfig: { repo: string; branch: string; paths: string[] },
		token: string,
		skillName: string,
		targetPath: string,
	) {
		setState({
			phase: "uploading",
			skillName,
			progress: 0,
			currentFile: "Reading files...",
		});

		try {
			// Get all files in skill directory
			const files = await getFilesRecursively(skillPath);

			if (files.length === 0) {
				setState({ phase: "error", message: "No files found in skill directory" });
				return;
			}

			// Upload each file
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const relativePath = file.substring(skillPath.length + 1);
				const remotePath = `${targetPath}/${relativePath}`;

				setState({
					phase: "uploading",
					skillName,
					progress: Math.round(((i + 1) / files.length) * 100),
					currentFile: relativePath,
				});

				const content = await readFile(file, "utf-8");

				// Get existing SHA if updating
				const existingSha = await getFileSha(
					token,
					repoConfig.repo,
					remotePath,
					repoConfig.branch,
				);

				const result = await uploadFile(
					token,
					repoConfig.repo,
					remotePath,
					content,
					repoConfig.branch,
					existingSha,
				);

				// F008: Handle no write access
				if (result.noAccess) {
					setState({ phase: "no_write_access", repo: repoConfig.repo });
					return;
				}

				// Handle repo not found
				if (result.notFound) {
					setState({ phase: "repo_not_found", repo: repoConfig.repo });
					return;
				}

				if (!result.success) {
					setState({
						phase: "error",
						message: result.message || `Failed to upload ${relativePath}`,
					});
					return;
				}
			}

			// F006: Success with GitHub link
			const githubUrl = `https://github.com/${repoConfig.repo}/tree/${repoConfig.branch}/${targetPath}`;
			setState({ phase: "success", skillName, githubUrl });
		} catch (err) {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Upload failed",
			});
		}
	}

	function handleConfirmOverwrite() {
		if (!publishContext) return;

		const { skillPath, repoConfig, token } = publishContext;
		const basePath = repoConfig.paths.length > 0 ? repoConfig.paths[0] : "";
		const targetPath =
			basePath && basePath !== "." ? `${basePath}/${skillName}` : skillName;

		performUpload(skillPath, repoConfig, token, skillName, targetPath);
	}

	function handleCancelOverwrite() {
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

	// Dynamic content (spinners, prompts)
	if (state.phase === "checking") {
		return <Spinner text="Validating skill..." />;
	}

	if (state.phase === "uploading") {
		return (
			<Box flexDirection="column">
				<Box>
					<Spinner text={`Publishing ${state.skillName}... ${state.progress}%`} />
				</Box>
				<Box marginLeft={2}>
					<Text dimColor>Uploading: {state.currentFile}</Text>
				</Box>
			</Box>
		);
	}

	if (state.phase === "exists_prompt") {
		return (
			<OverwritePrompt
				skillName={state.skillName}
				repo={state.repo}
				onConfirm={handleConfirmOverwrite}
				onCancel={handleCancelOverwrite}
			/>
		);
	}

	// Final content with Static
	const renderFinalContent = () => {
		switch (state.phase) {
			case "no_default_repo":
				return (
					<>
						<StatusMessage type="error">No default repo configured</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse repo use {"<owner/repo>"} to set a default
								repository.
							</Text>
						</Box>
					</>
				);

			case "skill_not_found":
				return (
					<>
						<StatusMessage type="error">
							Skill '{state.skillName}' not found
						</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>Searched in: {state.searchPath}</Text>
						</Box>
					</>
				);

			case "missing_skill_md":
				return (
					<>
						<StatusMessage type="error">
							SKILL.md not found in skill directory
						</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>Expected at: {state.skillPath}/SKILL.md</Text>
						</Box>
					</>
				);

			case "invalid_frontmatter":
				return (
					<StatusMessage type="error">
						SKILL.md missing required field: {state.field}
					</StatusMessage>
				);

			case "auth_required":
				return (
					<>
						<StatusMessage type="error">Authentication required</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>Run 'skilluse login' to authenticate.</Text>
						</Box>
					</>
				);

			case "no_write_access":
				return (
					<StatusMessage type="error">
						No write access to repo: {state.repo}
					</StatusMessage>
				);

			case "repo_not_found":
				return (
					<>
						<StatusMessage type="error">
							Repository not found: {state.repo}
						</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>
								Check that the repository exists and you have access to it.
							</Text>
						</Box>
					</>
				);

			case "success":
				return (
					<>
						<StatusMessage type="success">
							Published '{state.skillName}'
						</StatusMessage>
						<Box marginTop={1} marginLeft={2}>
							<Text dimColor>View at: </Text>
							<Text color="blue" underline>
								{state.githubUrl}
							</Text>
						</Box>
					</>
				);

			case "cancelled":
				return <StatusMessage type="warning">Publish cancelled</StatusMessage>;

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
