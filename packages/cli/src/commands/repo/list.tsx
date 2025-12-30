import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import { getConfig, type RepoConfig } from "../../services/index.js";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

type ListState =
	| { phase: "checking" }
	| { phase: "success"; defaultRepo: string | null; repos: RepoConfig[] }
	| { phase: "error"; message: string };

export default function RepoList(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<ListState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		// No auth needed - this only reads local config
		const config = getConfig();
		setState({
			phase: "success",
			defaultRepo: config.defaultRepo,
			repos: config.repos,
		});
	}, []);

	// Add output item when data is ready
	useEffect(() => {
		if (state.phase !== "checking" && outputItems.length === 0) {
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
		if (state.phase === "error") {
			return <StatusMessage type="error">{state.message}</StatusMessage>;
		}

		if (state.phase === "success" && state.repos.length === 0) {
			return (
				<>
					<Text bold>Configured Repositories</Text>
					<Box marginTop={1}>
						<Text dimColor>(no repositories configured)</Text>
					</Box>
					<Box marginTop={1}>
						<Text dimColor>
							Run 'skilluse repo add owner/repo' to add one.
						</Text>
					</Box>
				</>
			);
		}

		if (state.phase === "success") {
			return (
				<>
					<Text bold>Configured Repositories</Text>
					<Text> </Text>
					{state.repos.map((repo) => {
						const isDefault = repo.repo === state.defaultRepo;
						return (
							<Box key={repo.repo} flexDirection="column" marginBottom={1}>
								<Box>
									<Text color={isDefault ? "green" : undefined}>
										{isDefault ? "● " : "○ "}
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
				</>
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
