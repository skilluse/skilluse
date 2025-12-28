import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
	getConfig,
	getCredentials,
	type RepoConfig,
} from "../../services/index.js";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

type RepoState =
	| { phase: "checking" }
	| { phase: "not_logged_in" }
	| { phase: "success"; defaultRepo: string | null; repos: RepoConfig[] }
	| { phase: "error"; message: string };

export default function Repo(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<RepoState>({ phase: "checking" });

	useEffect(() => {
		async function checkRepo() {
			// Check if logged in
			const credentials = await getCredentials();
			if (!credentials) {
				setState({ phase: "not_logged_in" });
				exit();
				return;
			}

			const config = getConfig();
			setState({
				phase: "success",
				defaultRepo: config.defaultRepo,
				repos: config.repos,
			});
			exit();
		}

		checkRepo();
	}, [exit]);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Loading..." />;

		case "not_logged_in":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">Not authenticated</StatusMessage>
					<Text dimColor>Run 'skilluse login' to authenticate with GitHub</Text>
				</Box>
			);

		case "success": {
			if (!state.defaultRepo) {
				return (
					<Box flexDirection="column">
						<Text bold>Current Repository</Text>
						<Box marginTop={1}>
							<Text dimColor>(no default repo set)</Text>
						</Box>
						{state.repos.length === 0 ? (
							<Box marginTop={1} flexDirection="column">
								<Text dimColor>No repositories configured.</Text>
								<Text dimColor>
									Run 'skilluse repo add owner/repo' to add one.
								</Text>
							</Box>
						) : (
							<Box marginTop={1} flexDirection="column">
								<Text dimColor>
									{state.repos.length} repo{state.repos.length > 1 ? "s" : ""}{" "}
									configured.
								</Text>
								<Text dimColor>
									Run 'skilluse repo use owner/repo' to set a default.
								</Text>
							</Box>
						)}
					</Box>
				);
			}

			const defaultRepoConfig = state.repos.find(
				(r) => r.repo === state.defaultRepo,
			);

			return (
				<Box flexDirection="column">
					<Text bold>Current Repository</Text>
					<Box marginTop={1} flexDirection="column">
						<Box>
							<Text color="cyan">{state.defaultRepo}</Text>
							<Text dimColor> (default)</Text>
						</Box>
						{defaultRepoConfig && (
							<>
								<Box>
									<Text dimColor>Branch: </Text>
									<Text>{defaultRepoConfig.branch}</Text>
								</Box>
								<Box>
									<Text dimColor>Paths: </Text>
									<Text>
										{defaultRepoConfig.paths.length > 0
											? defaultRepoConfig.paths.join(", ")
											: "(all)"}
									</Text>
								</Box>
							</>
						)}
					</Box>
					{state.repos.length > 1 && (
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse repo list' to see all {state.repos.length}{" "}
								configured repos.
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
