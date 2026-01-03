import { existsSync } from "node:fs";
import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	buildGitHubHeaders,
	getAgent,
	getConfig,
	getCredentials,
	getCurrentAgent,
	getGitHubErrorMessage,
	type InstalledSkill,
	isAuthRequired,
	type RepoConfig,
} from "../services/index.js";

export const options = z.object({
	outdated: z.boolean().default(false).describe("Show only outdated skills"),
});

interface Props {
	options: z.infer<typeof options>;
}

interface SkillWithUpdate extends InstalledSkill {
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
	  }
	| { phase: "auth_required"; message: string }
	| { phase: "error"; message: string };

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

		return {
			...skill,
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
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		async function loadSkills() {
			const config = getConfig();
			const currentAgent = getCurrentAgent();
			const cwd = process.cwd();

			// Filter skills by agent, CWD (for local skills), and filesystem existence
			const skills = config.installed.filter((skill) => {
				// 1. Filter by current agent
				if (skill.agent !== currentAgent && skill.agent) {
					return false;
				}

				// 2. Local skills: only show if in current directory
				if (skill.scope === "local" && !skill.installedPath.startsWith(cwd)) {
					return false;
				}

				// 3. Verify file exists on filesystem
				if (!existsSync(skill.installedPath)) {
					return false;
				}

				return true;
			});

			if (!opts.outdated) {
				// Just show installed skills - no auth needed
				setState({
					phase: "success",
					skills,
					showingOutdated: false,
					currentAgent,
				});
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
			});
		}

		loadSkills();
	}, [opts.outdated]);

	// Add output item when data is ready (final states)
	useEffect(() => {
		const isFinalState =
			state.phase === "success" ||
			state.phase === "error" ||
			state.phase === "auth_required";

		if (isFinalState && outputItems.length === 0) {
			setOutputItems([{ id: "output" }]);
		}
	}, [state.phase, outputItems.length]);

	// Exit after output item is rendered
	useEffect(() => {
		if (outputItems.length > 0) {
			// Use nextTick to ensure Static has completed rendering
			process.nextTick(() => exit());
		}
	}, [outputItems.length, exit]);

	const renderContent = () => {
		if (state.phase === "auth_required") {
			return <StatusMessage type="error">{state.message}</StatusMessage>;
		}

		if (state.phase === "error") {
			return <StatusMessage type="error">{state.message}</StatusMessage>;
		}

		if (state.phase === "success") {
			const agentInfo = getAgent(state.currentAgent);
			const agentName = agentInfo?.name || state.currentAgent;

			if (state.skills.length === 0) {
				if (state.showingOutdated) {
					return (
						<StatusMessage type="success">
							All skills are up to date
						</StatusMessage>
					);
				}
				return (
					<>
						<Box>
							<Text bold>Installed Skills</Text>
							<Text dimColor> ({agentName})</Text>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>(no skills installed)</Text>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse install skill-name' to install one.
							</Text>
						</Box>
					</>
				);
			}

			if (state.showingOutdated) {
				return (
					<>
						<Box>
							<Text bold>Outdated Skills</Text>
							<Text dimColor> ({agentName})</Text>
						</Box>
						<Text> </Text>
						{state.skills.map((skill) => (
							<Box key={skill.name} flexDirection="column" marginBottom={1}>
								<Box>
									<Text color="yellow" bold>
										{skill.name}
									</Text>
									<Text dimColor> ({skill.scope})</Text>
								</Box>
								<Box marginLeft={2}>
									<Text dimColor>From: {skill.repo}</Text>
								</Box>
							</Box>
						))}
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse upgrade' to update all, or 'skilluse upgrade
								skill-name' for one.
							</Text>
						</Box>
					</>
				);
			}

			return (
				<>
					<Box>
						<Text bold>Installed Skills</Text>
						<Text dimColor> ({agentName})</Text>
					</Box>
					<Text> </Text>
					{state.skills.map((skill) => (
						<Box key={skill.name} flexDirection="column" marginBottom={1}>
							<Box>
								<Text color="cyan" bold>
									{skill.name}
								</Text>
								<Text dimColor> ({skill.scope})</Text>
							</Box>
							<Box marginLeft={2}>
								<Text dimColor>
									From: {skill.repo} | Path: {skill.installedPath}
								</Text>
							</Box>
						</Box>
					))}
				</>
			);
		}

		return null;
	};

	return (
		<>
			{(state.phase === "checking" ||
				state.phase === "checking_updates") && (
				<Spinner
					text={
						state.phase === "checking_updates"
							? `Checking for updates (${state.current}/${state.total})...`
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
