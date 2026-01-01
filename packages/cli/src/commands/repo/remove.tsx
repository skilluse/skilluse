import { Box, Static, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import { getConfig, removeRepo } from "../../services/index.js";

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
	| { phase: "not_found"; repo: string }
	| { phase: "confirm"; repo: string }
	| { phase: "success"; repo: string }
	| { phase: "cancelled" }
	| { phase: "error"; message: string };

export default function RepoRemove({ args: [repoArg], options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<RemoveState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		function checkAndRemove() {
			// No auth needed - this only modifies local config
			const config = getConfig();
			if (!config.repos.find((r) => r.repo === repoArg)) {
				setState({ phase: "not_found", repo: repoArg });
				return;
			}

			// If force flag, remove directly
			if (opts.force) {
				removeRepo(repoArg);
				setState({ phase: "success", repo: repoArg });
				return;
			}

			// Otherwise, prompt for confirmation
			setState({ phase: "confirm", repo: repoArg });
		}

		checkAndRemove();
	}, [repoArg, opts.force]);

	// Handle confirmation input
	useInput(
		(input, key) => {
			if (state.phase !== "confirm") return;

			if (input.toLowerCase() === "y" || key.return) {
				removeRepo(state.repo);
				setState({ phase: "success", repo: state.repo });
				return;
			}

			if (input.toLowerCase() === "n" || key.escape) {
				setState({ phase: "cancelled" });
				return;
			}
		},
		{ isActive: state.phase === "confirm" },
	);

	// Add output item when state is final
	useEffect(() => {
		const isFinalState =
			state.phase === "not_found" ||
			state.phase === "success" ||
			state.phase === "cancelled" ||
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
			case "not_found":
				return (
					<Box flexDirection="column">
						<StatusMessage type="error">
							Repository '{state.repo}' not found in config
						</StatusMessage>
						<Text dimColor>Run 'skilluse repo list' to see configured repos</Text>
					</Box>
				);

			case "success":
				return <StatusMessage type="success">Removed {state.repo}</StatusMessage>;

			case "cancelled":
				return <Text dimColor>Removal cancelled</Text>;

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<>
			{state.phase === "checking" && <Spinner text="Checking..." />}
			{state.phase === "confirm" && (
				<Box flexDirection="column">
					<Text>
						Remove repository <Text color="cyan">{state.repo}</Text>?
					</Text>
					<Box marginTop={1}>
						<Text dimColor>Press Y to confirm, N to cancel</Text>
					</Box>
				</Box>
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
