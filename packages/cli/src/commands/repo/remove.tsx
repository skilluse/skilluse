import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import { getConfig, getCredentials, removeRepo } from "../../services/index.js";

export const args = z.tuple([
	z.string().describe("Repository in owner/repo format"),
]);

export const options = z.object({
	force: z.boolean().default(false).describe("Skip confirmation prompt"),
});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type RemoveState =
	| { phase: "checking" }
	| { phase: "not_logged_in" }
	| { phase: "not_found"; repo: string }
	| { phase: "confirm"; repo: string }
	| { phase: "success"; repo: string }
	| { phase: "cancelled" }
	| { phase: "error"; message: string };

export default function RepoRemove({ args: [repoArg], options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<RemoveState>({ phase: "checking" });

	useEffect(() => {
		async function checkAndRemove() {
			// Check if logged in
			const credentials = await getCredentials();
			if (!credentials) {
				setState({ phase: "not_logged_in" });
				exit();
				return;
			}

			// Check if repo exists in config
			const config = getConfig();
			if (!config.repos.find((r) => r.repo === repoArg)) {
				setState({ phase: "not_found", repo: repoArg });
				exit();
				return;
			}

			// If force flag, remove directly
			if (opts.force) {
				removeRepo(repoArg);
				setState({ phase: "success", repo: repoArg });
				exit();
				return;
			}

			// Otherwise, prompt for confirmation
			setState({ phase: "confirm", repo: repoArg });
		}

		checkAndRemove();
	}, [repoArg, opts.force, exit]);

	// Handle confirmation input
	useInput(
		(input, key) => {
			if (state.phase !== "confirm") return;

			if (input.toLowerCase() === "y" || key.return) {
				removeRepo(state.repo);
				setState({ phase: "success", repo: state.repo });
				exit();
				return;
			}

			if (input.toLowerCase() === "n" || key.escape) {
				setState({ phase: "cancelled" });
				exit();
				return;
			}
		},
		{ isActive: state.phase === "confirm" },
	);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Checking..." />;

		case "not_logged_in":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">Not authenticated</StatusMessage>
					<Text dimColor>Run 'skilluse login' to authenticate with GitHub</Text>
				</Box>
			);

		case "not_found":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">
						Repository '{state.repo}' not found in config
					</StatusMessage>
					<Text dimColor>Run 'skilluse repo list' to see configured repos</Text>
				</Box>
			);

		case "confirm":
			return (
				<Box flexDirection="column">
					<Text>
						Remove repository <Text color="cyan">{state.repo}</Text>?
					</Text>
					<Box marginTop={1}>
						<Text dimColor>Press Y to confirm, N to cancel</Text>
					</Box>
				</Box>
			);

		case "success":
			return <StatusMessage type="success">Removed {state.repo}</StatusMessage>;

		case "cancelled":
			return <Text dimColor>Removal cancelled</Text>;

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
