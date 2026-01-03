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
	type InstalledSkill,
	type RepoConfig,
} from "../services/index.js";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

interface GitHubUser {
	login: string;
	name: string | null;
}

type StatusState =
	| { phase: "checking" }
	| {
			phase: "success";
			isLoggedIn: boolean;
			username?: string;
			currentAgent: string;
			agentName: string;
			repos: RepoConfig[];
			defaultRepo: string | null;
			skills: InstalledSkill[];
	  }
	| { phase: "error"; message: string };

export default function Index(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<StatusState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		async function checkStatus() {
			const config = getConfig();
			const currentAgent = getCurrentAgent();
			const agentInfo = getAgent(currentAgent);
			const agentName = agentInfo?.name || currentAgent;
			const cwd = process.cwd();

			// Get skills for current agent with CWD and filesystem filtering
			const skills = config.installed.filter((skill) => {
				// Filter by current agent
				if (skill.agent !== currentAgent && skill.agent) {
					return false;
				}
				// Local skills: only show if in current directory
				if (skill.scope === "local" && !skill.installedPath.startsWith(cwd)) {
					return false;
				}
				// Verify file exists on filesystem
				if (!existsSync(skill.installedPath)) {
					return false;
				}
				return true;
			});

			// Check if logged in
			const credentials = await getCredentials();
			if (!credentials) {
				setState({
					phase: "success",
					isLoggedIn: false,
					currentAgent,
					agentName,
					repos: config.repos,
					defaultRepo: config.defaultRepo,
					skills,
				});
				return;
			}

			// Fetch user info from GitHub
			try {
				const response = await fetch("https://api.github.com/user", {
					headers: buildGitHubHeaders(credentials.token),
				});

				if (!response.ok) {
					setState({
						phase: "success",
						isLoggedIn: false,
						currentAgent,
						agentName,
						repos: config.repos,
						defaultRepo: config.defaultRepo,
						skills,
					});
					return;
				}

				const userData = (await response.json()) as GitHubUser;

				setState({
					phase: "success",
					isLoggedIn: true,
					username: userData.login,
					currentAgent,
					agentName,
					repos: config.repos,
					defaultRepo: config.defaultRepo,
					skills,
				});
			} catch (err) {
				setState({
					phase: "error",
					message:
						err instanceof Error ? err.message : "Failed to fetch status",
				});
			}
		}

		checkStatus();
	}, []);

	// Add output item when state is final
	useEffect(() => {
		const isFinalState = state.phase === "success" || state.phase === "error";

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
		if (state.phase === "error") {
			return <StatusMessage type="error">{state.message}</StatusMessage>;
		}

		if (state.phase === "success") {
			return (
				<Box flexDirection="column">
					{/* Authentication Section */}
					<Text bold>Authentication</Text>
					<Box marginLeft={2} marginBottom={1}>
						{state.isLoggedIn ? (
							<Text>
								<Text color="green">✓</Text> Logged in as{" "}
								<Text color="green">@{state.username}</Text>
							</Text>
						) : (
							<Text>
								<Text dimColor>○</Text>{" "}
								<Text dimColor>Not logged in (run 'skilluse login')</Text>
							</Text>
						)}
					</Box>

					{/* Agent Section */}
					<Text bold>Agent</Text>
					<Box marginLeft={2} marginBottom={1}>
						<Text>
							<Text color="cyan">●</Text> {state.agentName}{" "}
							<Text dimColor>({state.currentAgent})</Text>
						</Text>
					</Box>

					{/* Repos Section */}
					<Text bold>Repos ({state.repos.length})</Text>
					<Box flexDirection="column" marginLeft={2} marginBottom={1}>
						{state.repos.length === 0 ? (
							<Text dimColor>(no repositories configured)</Text>
						) : (
							state.repos.map((repo) => {
								const isDefault = repo.repo === state.defaultRepo;
								const pathDisplay =
									repo.paths.length > 0 ? repo.paths.join(", ") : "(all)";
								return (
									<Box key={repo.repo}>
										<Text>
											{isDefault ? (
												<Text color="cyan">●</Text>
											) : (
												<Text dimColor>○</Text>
											)}{" "}
											{repo.repo}{" "}
											<Text dimColor>
												[{repo.branch}] {pathDisplay}
											</Text>
											{isDefault && <Text color="cyan"> (default)</Text>}
										</Text>
									</Box>
								);
							})
						)}
					</Box>

					{/* Installed Skills Section */}
					<Text bold>Installed Skills ({state.skills.length})</Text>
					<Box flexDirection="column" marginLeft={2} marginBottom={1}>
						{state.skills.length === 0 ? (
							<Text dimColor>(no skills installed)</Text>
						) : (
							state.skills.map((skill) => (
								<Box key={skill.name}>
									<Text>
										{skill.name}{" "}
										<Text dimColor>from {skill.repo}</Text>
									</Text>
								</Box>
							))
						)}
					</Box>

					{/* Commands Section */}
					<Box marginTop={0}>
						<Text dimColor>Run </Text>
						<Text color="cyan">skilluse --help</Text>
						<Text dimColor> for all commands</Text>
					</Box>
				</Box>
			);
		}

		return null;
	};

	return (
		<>
			{state.phase === "checking" && <Spinner text="Loading..." />}
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
