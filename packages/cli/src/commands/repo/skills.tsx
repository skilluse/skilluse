import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
	buildGitHubHeaders,
	buildGitHubRawHeaders,
	getConfig,
	getCredentials,
	getCurrentAgent,
	getGitHubErrorMessage,
	isAuthRequired,
	type RepoConfig,
} from "../../services/index.js";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

interface SkillMetadata {
	name: string;
	description: string;
	type?: string;
	version?: string;
	repo: string;
	path: string;
	installed: boolean;
}

type SkillsState =
	| { phase: "checking" }
	| { phase: "no_repos" }
	| { phase: "fetching"; repo: string }
	| { phase: "success"; skills: SkillMetadata[]; repoName: string }
	| { phase: "auth_required"; message: string }
	| { phase: "error"; message: string };

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

		if (key) {
			result[key] = value;
		}
	}

	return result;
}

/**
 * Fetch all skills from a GitHub repo
 */
async function fetchSkillsFromRepo(
	token: string | undefined,
	repoConfig: RepoConfig,
	installedSkillNames: Set<string>,
): Promise<SkillMetadata[] | { authRequired: true; message: string }> {
	const { repo, branch, paths } = repoConfig;
	const skills: SkillMetadata[] = [];

	// Search paths - if none specified, search root
	const searchPaths = paths.length > 0 ? paths : [""];

	for (const basePath of searchPaths) {
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

			// Find directories that might contain SKILL.md
			const dirs = contents.filter((item) => item.type === "dir");

			for (const dir of dirs) {
				// Check if this directory has a SKILL.md
				const skillMdUrl = `https://api.github.com/repos/${repo}/contents/${dir.path}/SKILL.md?ref=${branch}`;
				const skillResponse = await fetch(skillMdUrl, {
					headers: buildGitHubRawHeaders(token),
				});

				if (skillResponse.ok) {
					const content = await skillResponse.text();
					const frontmatter = parseFrontmatter(content);

					if (frontmatter.name) {
						const skillName = String(frontmatter.name);
						skills.push({
							name: skillName,
							description: String(frontmatter.description || ""),
							type: frontmatter.type ? String(frontmatter.type) : undefined,
							version: frontmatter.version
								? String(frontmatter.version)
								: undefined,
							repo,
							path: dir.path,
							installed: installedSkillNames.has(skillName),
						});
					}
				}
			}
		} catch {
			// Continue on error
		}
	}

	// Sort: installed first, then alphabetically
	skills.sort((a, b) => {
		if (a.installed !== b.installed) {
			return a.installed ? -1 : 1;
		}
		return a.name.localeCompare(b.name);
	});

	return skills;
}

export default function RepoSkills(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<SkillsState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		async function loadSkills() {
			const config = getConfig();
			const currentAgent = getCurrentAgent();

			// Get default repo
			let repoConfig: RepoConfig | undefined;

			if (config.defaultRepo) {
				repoConfig = config.repos.find((r) => r.repo === config.defaultRepo);
			} else if (config.repos.length > 0) {
				repoConfig = config.repos[0];
			}

			if (!repoConfig) {
				setState({ phase: "no_repos" });
				return;
			}

			setState({ phase: "fetching", repo: repoConfig.repo });

			// Get installed skill names for current agent
			const installedSkillNames = new Set(
				config.installed
					.filter((s) => s.agent === currentAgent || !s.agent)
					.map((s) => s.name),
			);

			// Get optional credentials
			const credentials = await getCredentials();
			const token = credentials?.token;

			const result = await fetchSkillsFromRepo(
				token,
				repoConfig,
				installedSkillNames,
			);

			if ("authRequired" in result) {
				setState({ phase: "auth_required", message: result.message });
				return;
			}

			setState({
				phase: "success",
				skills: result,
				repoName: repoConfig.repo,
			});
		}

		loadSkills().catch((err) => {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Failed to load skills",
			});
		});
	}, []);

	// Add output item when state is final
	useEffect(() => {
		const isFinalState =
			state.phase === "no_repos" ||
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
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			case "no_repos":
				return (
					<Box flexDirection="column">
						<StatusMessage type="warning">
							No repositories configured
						</StatusMessage>
						<Text dimColor>
							Run 'skilluse repo add owner/repo' to add a skill repository.
						</Text>
					</Box>
				);

			case "success": {
				const installedCount = state.skills.filter((s) => s.installed).length;

				if (state.skills.length === 0) {
					return (
						<Box flexDirection="column">
							<Box marginBottom={1}>
								<Text bold>Skills in </Text>
								<Text color="cyan">{state.repoName}</Text>
							</Box>
							<StatusMessage type="warning">No skills found</StatusMessage>
						</Box>
					);
				}

				return (
					<Box flexDirection="column">
						<Box marginBottom={1}>
							<Text bold>Skills in </Text>
							<Text color="cyan">{state.repoName}</Text>
							<Text dimColor>
								{" "}
								({installedCount}/{state.skills.length} installed)
							</Text>
						</Box>

						{state.skills.map((skill) => (
							<Box
								key={`${skill.repo}/${skill.path}`}
								flexDirection="column"
								marginBottom={1}
							>
								<Box>
									{skill.installed ? (
										<Text color="green">● </Text>
									) : (
										<Text dimColor>○ </Text>
									)}
									<Text color={skill.installed ? "green" : "cyan"} bold>
										{skill.name}
									</Text>
									{skill.version && <Text dimColor> v{skill.version}</Text>}
									{skill.installed && <Text dimColor> (installed)</Text>}
								</Box>
								<Box marginLeft={2}>
									<Text dimColor>{skill.description}</Text>
								</Box>
							</Box>
						))}

						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse install skill-name' to install a skill.
							</Text>
						</Box>
					</Box>
				);
			}

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<>
			{(state.phase === "checking" || state.phase === "fetching") && (
				<Spinner
					text={
						state.phase === "fetching"
							? `Fetching skills from ${state.repo}...`
							: "Loading..."
					}
				/>
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
