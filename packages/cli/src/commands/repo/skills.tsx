import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
	fetchSkillsFromRepo,
	getConfig,
	getCredentials,
	getCurrentAgent,
	type RepoConfig,
	type SkillMetadata,
} from "../../services/index.js";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

interface SkillWithInstalled extends SkillMetadata {
	installed: boolean;
}

type SkillsState =
	| { phase: "checking" }
	| { phase: "no_repos" }
	| { phase: "fetching"; repo: string }
	| { phase: "success"; skills: SkillWithInstalled[]; repoName: string }
	| { phase: "auth_required"; message: string }
	| { phase: "error"; message: string };

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

			const result = await fetchSkillsFromRepo(token, repoConfig);

			if ("authRequired" in result) {
				setState({ phase: "auth_required", message: result.message });
				return;
			}

			// Add installed status and sort (installed first, then alphabetically)
			const skillsWithInstalled: SkillWithInstalled[] = result
				.map((skill) => ({
					...skill,
					installed: installedSkillNames.has(skill.name),
				}))
				.sort((a, b) => {
					if (a.installed !== b.installed) {
						return a.installed ? -1 : 1;
					}
					return a.name.localeCompare(b.name);
				});

			setState({
				phase: "success",
				skills: skillsWithInstalled,
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
