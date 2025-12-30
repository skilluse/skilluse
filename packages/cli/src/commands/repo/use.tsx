import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import { getConfig, setDefaultRepo } from "../../services/index.js";

export const args = z.tuple([
	z.string().describe("Repository in owner/repo format"),
]);

export const options = z.object({});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type UseState =
	| { phase: "checking" }
	| { phase: "not_found"; repo: string }
	| { phase: "already_default"; repo: string }
	| { phase: "success"; repo: string }
	| { phase: "error"; message: string };

export default function RepoUse({ args: [repoArg], options: _opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<UseState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		// No auth needed - this only modifies local config
		const config = getConfig();
		if (!config.repos.find((r) => r.repo === repoArg)) {
			setState({ phase: "not_found", repo: repoArg });
			return;
		}

		if (config.defaultRepo === repoArg) {
			setState({ phase: "already_default", repo: repoArg });
			return;
		}

		setDefaultRepo(repoArg);
		setState({ phase: "success", repo: repoArg });
	}, [repoArg]);

	useEffect(() => {
		if (state.phase !== "checking" && outputItems.length === 0) {
			setOutputItems([{ id: "output" }]);
		}
	}, [state.phase, outputItems.length]);

	useEffect(() => {
		if (outputItems.length > 0) {
			process.nextTick(() => exit());
		}
	}, [outputItems.length, exit]);

	const renderContent = () => {
		switch (state.phase) {
			case "not_found":
				return (
					<>
						<StatusMessage type="error">
							Repository {state.repo} not found in config
						</StatusMessage>
						<Text dimColor>
							Run 'skilluse repo add {state.repo}' to add it first.
						</Text>
					</>
				);

			case "already_default":
				return (
					<StatusMessage type="success">
						{state.repo} is already the default
					</StatusMessage>
				);

			case "success":
				return (
					<StatusMessage type="success">
						Default repo set to {state.repo}
					</StatusMessage>
				);

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<>
			{state.phase === "checking" && <Spinner text="Setting default..." />}
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
