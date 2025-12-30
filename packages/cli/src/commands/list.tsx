import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	buildGitHubHeaders,
	buildGitHubRawHeaders,
	getAgent,
	getConfig,
	getCredentials,
	getCurrentAgent,
	getGitHubErrorMessage,
	type InstalledSkill,
	isAuthRequired,
	isRateLimited,
	type RepoConfig,
} from "../services/index.js";

export const options = z.object({
	outdated: z.boolean().default(false).describe("Show only outdated skills"),
	all: z.boolean().default(false).describe("Show skills for all agents"),
});

interface Props {
	options: z.infer<typeof options>;
}

interface SkillWithUpdate extends InstalledSkill {
	latestVersion?: string;
	latestSha?: string;
	hasUpdate?: boolean;
}

type ListState =
	| { phase: "checking" }
	| { phase: "checking_updates"; current: number; total: number }
	| {
			phase: "success";
			skills: SkillWithUpdate[];
			showingOutdated: boolean;
			currentAgent: string;
			showingAll: boolean;
	  }
	| { phase: "auth_required"; message: string }
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
 * Returns null if auth is required for private repo access
 */
async function checkForUpdate(
	token: string | undefined,
	skill: InstalledSkill,
	repoConfig: RepoConfig,
): Promise<SkillWithUpdate | { authRequired: true; message: string }> {
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
			return { ...skill, hasUpdate: false };
		}

		const refData = (await refResponse.json()) as { sha: string };
		const latestSha = refData.sha;

		// If SHA matches, no update needed
		if (latestSha === skill.commitSha) {
			return { ...skill, hasUpdate: false };
		}

		// Get latest version from SKILL.md
		const skillMdUrl = `https://api.github.com/repos/${repo}/contents/${skill.repoPath}/SKILL.md?ref=${branch}`;
		const skillResponse = await fetch(skillMdUrl, {
			headers: buildGitHubRawHeaders(token),
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
			...skill,
			latestVersion,
			latestSha,
			hasUpdate: true,
		};
	} catch {
		return { ...skill, hasUpdate: false };
	}
}

export default function List({ options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<ListState>({ phase: "checking" });

	useEffect(() => {
		async function loadSkills() {
			const config = getConfig();
			const currentAgent = getCurrentAgent();

			// Filter skills by current agent unless --all is passed
			const skills = opts.all
				? config.installed
				: config.installed.filter(
						(s) => s.agent === currentAgent || !s.agent, // Include legacy skills without agent field
					);

			if (!opts.outdated) {
				// Just show installed skills - no auth needed
				setState({
					phase: "success",
					skills,
					showingOutdated: false,
					currentAgent,
					showingAll: opts.all,
				});
				exit();
				return;
			}

			// For --outdated, get optional credentials
			const credentials = await getCredentials();
			const token = credentials?.token;

			// Check for updates
			const skillsWithUpdates: SkillWithUpdate[] = [];

			for (let i = 0; i < skills.length; i++) {
				setState({
					phase: "checking_updates",
					current: i + 1,
					total: skills.length,
				});

				const skill = skills[i];
				const repoConfig = config.repos.find((r) => r.repo === skill.repo);

				if (repoConfig) {
					const result = await checkForUpdate(token, skill, repoConfig);

					// Check if auth is required for this repo
					if ("authRequired" in result) {
						setState({
							phase: "auth_required",
							message: result.message,
						});
						exit();
						return;
					}

					if (result.hasUpdate) {
						skillsWithUpdates.push(result);
					}
				}
			}

			setState({
				phase: "success",
				skills: skillsWithUpdates,
				showingOutdated: true,
				currentAgent,
				showingAll: opts.all,
			});
			exit();
		}

		loadSkills();
	}, [opts.outdated, opts.all, exit]);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Loading..." />;

		case "auth_required":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">{state.message}</StatusMessage>
				</Box>
			);

		case "checking_updates":
			return (
				<Spinner
					text={`Checking for updates (${state.current}/${state.total})...`}
				/>
			);

		case "success": {
			const agentInfo = getAgent(state.currentAgent);
			const agentName = agentInfo?.name || state.currentAgent;

			if (state.skills.length === 0) {
				if (state.showingOutdated) {
					return (
						<Box flexDirection="column">
							<StatusMessage type="success">
								All skills are up to date
							</StatusMessage>
						</Box>
					);
				}
				return (
					<Box flexDirection="column">
						<Box>
							<Text bold>Installed Skills</Text>
							{!state.showingAll && (
								<Text dimColor> ({agentName})</Text>
							)}
						</Box>
						<Box marginTop={1}>
							<Text dimColor>(no skills installed)</Text>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse install skill-name' to install one.
							</Text>
						</Box>
						{!state.showingAll && (
							<Box>
								<Text dimColor>
									Run 'skilluse list --all' to see skills for all agents.
								</Text>
							</Box>
						)}
					</Box>
				);
			}

			if (state.showingOutdated) {
				return (
					<Box flexDirection="column">
						<Box>
							<Text bold>Outdated Skills</Text>
							{!state.showingAll && (
								<Text dimColor> ({agentName})</Text>
							)}
						</Box>
						<Text> </Text>
						{state.skills.map((skill) => (
							<Box key={skill.name} flexDirection="column" marginBottom={1}>
								<Box>
									<Text color="yellow" bold>
										{skill.name}
									</Text>
									<Text dimColor> v{skill.version}</Text>
									<Text color="green"> → v{skill.latestVersion}</Text>
									{state.showingAll && skill.agent && (
										<Text dimColor> [{skill.agent}]</Text>
									)}
								</Box>
								<Box marginLeft={2}>
									<Text dimColor>
										From: {skill.repo} | Scope: {skill.scope}
									</Text>
								</Box>
							</Box>
						))}
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse upgrade' to update all, or 'skilluse upgrade
								skill-name' for one.
							</Text>
						</Box>
					</Box>
				);
			}

			return (
				<Box flexDirection="column">
					<Box>
						<Text bold>Installed Skills</Text>
						{!state.showingAll && (
							<Text dimColor> ({agentName})</Text>
						)}
					</Box>
					<Text> </Text>
					{state.skills.map((skill) => (
						<Box key={skill.name} flexDirection="column" marginBottom={1}>
							<Box>
								<Text color="cyan" bold>
									{skill.name}
								</Text>
								<Text dimColor> v{skill.version}</Text>
								<Text dimColor> ({skill.scope})</Text>
								{state.showingAll && skill.agent && (
									<Text dimColor> [{skill.agent}]</Text>
								)}
							</Box>
							<Box marginLeft={2}>
								<Text dimColor>
									From: {skill.repo} | Path: {skill.installedPath}
								</Text>
							</Box>
						</Box>
					))}
					{!state.showingAll && (
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse list --all' to see skills for all agents.
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
