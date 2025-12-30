import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	buildGitHubHeaders,
	getAgent,
	getConfig,
	getCredentials,
	getCurrentAgent,
	getInstallations,
	type StoredInstallation,
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
			phase: "not_logged_in";
			defaultRepo: string | null;
			installedCount: number;
			repoCount: number;
			currentAgent: string;
			agentName: string;
	  }
	| {
			phase: "logged_in";
			user: GitHubUser;
			defaultRepo: string | null;
			installedCount: number;
			repoCount: number;
			installations: StoredInstallation[];
			currentAgent: string;
			agentName: string;
	  }
	| { phase: "error"; message: string };

export default function Index(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<StatusState>({ phase: "checking" });

	useEffect(() => {
		async function checkStatus() {
			const config = getConfig();
			const currentAgent = getCurrentAgent();
			const agentInfo = getAgent(currentAgent);
			const agentName = agentInfo?.name || currentAgent;

			// Count skills for current agent
			const installedCount = config.installed.filter(
				(s) => s.agent === currentAgent || !s.agent,
			).length;

			// Check if logged in
			const credentials = await getCredentials();
			if (!credentials) {
				setState({
					phase: "not_logged_in",
					defaultRepo: config.defaultRepo,
					installedCount,
					repoCount: config.repos.length,
					currentAgent,
					agentName,
				});
				exit();
				return;
			}

			// Fetch user info from GitHub
			try {
				const response = await fetch("https://api.github.com/user", {
					headers: buildGitHubHeaders(credentials.token),
				});

				if (!response.ok) {
					if (response.status === 401) {
						setState({
							phase: "not_logged_in",
							defaultRepo: config.defaultRepo,
							installedCount,
							repoCount: config.repos.length,
							currentAgent,
							agentName,
						});
					} else {
						setState({
							phase: "error",
							message: `GitHub API error: ${response.status}`,
						});
					}
					exit();
					return;
				}

				const userData = (await response.json()) as GitHubUser;
				const installations = getInstallations();

				setState({
					phase: "logged_in",
					user: userData,
					defaultRepo: config.defaultRepo,
					installedCount,
					repoCount: config.repos.length,
					installations,
					currentAgent,
					agentName,
				});
			} catch (err) {
				setState({
					phase: "error",
					message:
						err instanceof Error ? err.message : "Failed to fetch status",
				});
			}

			exit();
		}

		checkStatus();
	}, [exit]);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Loading..." />;

		case "not_logged_in":
			return (
				<Box flexDirection="column" padding={1}>
					<Box marginBottom={1}>
						<Text color="green" bold>
							skilluse
						</Text>
						<Text> - AI Coding Agent Skills Manager</Text>
					</Box>

					<Box flexDirection="column" marginBottom={1}>
						<Box>
							<Text dimColor>Not logged in</Text>
							<Text dimColor>
								{" "}
								(public repos accessible, private repos require login)
							</Text>
						</Box>
					</Box>

					<Box flexDirection="column" marginBottom={1}>
						<Box>
							<Text>Current agent: </Text>
							<Text color="cyan">{state.agentName}</Text>
							<Text dimColor> ({state.currentAgent})</Text>
						</Box>
						<Box>
							<Text>Installed skills: </Text>
							<Text>{state.installedCount}</Text>
						</Box>
						<Box>
							<Text>Default repo: </Text>
							{state.defaultRepo ? (
								<Text color="cyan">{state.defaultRepo}</Text>
							) : (
								<Text dimColor>(not set)</Text>
							)}
						</Box>
						<Box>
							<Text>Configured repos: </Text>
							<Text>{state.repoCount}</Text>
						</Box>
					</Box>

					<Box marginTop={1} flexDirection="column">
						<Text bold>Quick Actions:</Text>
						<Text dimColor> skilluse login Authenticate with GitHub</Text>
						<Text dimColor>
							{" "}
							skilluse repo add owner/repo Add a skill repository
						</Text>
						<Text dimColor> skilluse list Browse available skills</Text>
						<Text dimColor> skilluse install skill-name Install a skill</Text>
						<Text dimColor> skilluse --help Show all commands</Text>
					</Box>
				</Box>
			);

		case "logged_in":
			return (
				<Box flexDirection="column" padding={1}>
					<Box marginBottom={1}>
						<Text color="green" bold>
							skilluse
						</Text>
						<Text> - AI Coding Agent Skills Manager</Text>
					</Box>

					<Box flexDirection="column" marginBottom={1}>
						<Box>
							<Text>Logged in as </Text>
							<Text color="green" bold>
								{state.user.login}
							</Text>
							{state.user.name && <Text dimColor> ({state.user.name})</Text>}
						</Box>
					</Box>

					<Box flexDirection="column" marginBottom={1}>
						<Box>
							<Text>Current agent: </Text>
							<Text color="cyan">{state.agentName}</Text>
							<Text dimColor> ({state.currentAgent})</Text>
						</Box>
						<Box>
							<Text>Installed skills: </Text>
							<Text>{state.installedCount}</Text>
						</Box>
						<Box>
							<Text>Default repo: </Text>
							{state.defaultRepo ? (
								<Text color="cyan">{state.defaultRepo}</Text>
							) : (
								<Text dimColor>(not set)</Text>
							)}
						</Box>
						<Box>
							<Text>Configured repos: </Text>
							<Text>{state.repoCount}</Text>
						</Box>
					</Box>

					<Box marginTop={1} flexDirection="column">
						<Text bold>Quick Actions:</Text>
						<Text dimColor>
							{" "}
							skilluse repo add owner/repo Add a skill repository
						</Text>
						<Text dimColor> skilluse list Browse available skills</Text>
						<Text dimColor> skilluse install skill-name Install a skill</Text>
						<Text dimColor> skilluse --help Show all commands</Text>
					</Box>
				</Box>
			);

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
