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

type ListState =
	| { phase: "checking" }
	| { phase: "not_logged_in" }
	| { phase: "success"; defaultRepo: string | null; repos: RepoConfig[] }
	| { phase: "error"; message: string };

export default function RepoList(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<ListState>({ phase: "checking" });

	useEffect(() => {
		async function loadRepos() {
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

		loadRepos();
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

		case "success":
			if (state.repos.length === 0) {
				return (
					<Box flexDirection="column">
						<Text bold>Configured Repositories</Text>
						<Box marginTop={1}>
							<Text dimColor>(no repositories configured)</Text>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>
								Run 'skilluse repo add owner/repo' to add one.
							</Text>
						</Box>
					</Box>
				);
			}

			return (
				<Box flexDirection="column">
					<Text bold>Configured Repositories</Text>
					<Text> </Text>
					{state.repos.map((repo) => {
						const isDefault = repo.repo === state.defaultRepo;
						return (
							<Box key={repo.repo} flexDirection="column" marginBottom={1}>
								<Box>
									<Text color={isDefault ? "green" : undefined}>
										{isDefault ? "* " : "  "}
									</Text>
									<Text color={isDefault ? "cyan" : undefined} bold={isDefault}>
										{repo.repo}
									</Text>
									{isDefault && <Text dimColor> (default)</Text>}
								</Box>
								<Box marginLeft={2}>
									<Text dimColor>
										Branch: {repo.branch} | Paths:{" "}
										{repo.paths.length > 0 ? repo.paths.join(", ") : "(all)"}
									</Text>
								</Box>
							</Box>
						);
					})}
				</Box>
			);

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
