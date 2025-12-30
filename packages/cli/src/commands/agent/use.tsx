import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
	getAgent,
	getCurrentAgent,
	setCurrentAgent,
} from "../../services/index.js";

export const args = z.tuple([z.string().describe("Agent ID to switch to")]);

export const options = z.object({});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type UseState =
	| { phase: "checking" }
	| { phase: "not_found"; agentId: string }
	| { phase: "already_current"; agentId: string; agentName: string }
	| { phase: "success"; agentId: string; agentName: string }
	| { phase: "error"; message: string };

export default function AgentUse({ args: [agentIdArg], options: _opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<UseState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		const agent = getAgent(agentIdArg);
		if (!agent) {
			setState({ phase: "not_found", agentId: agentIdArg });
			return;
		}

		const currentAgent = getCurrentAgent();
		if (currentAgent === agentIdArg) {
			setState({
				phase: "already_current",
				agentId: agentIdArg,
				agentName: agent.name,
			});
			return;
		}

		setCurrentAgent(agentIdArg);
		setState({
			phase: "success",
			agentId: agentIdArg,
			agentName: agent.name,
		});
	}, [agentIdArg]);

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
							Unknown agent: {state.agentId}
						</StatusMessage>
						<Text dimColor>Run 'skilluse agent' to see available agents.</Text>
					</>
				);

			case "already_current":
				return (
					<StatusMessage type="success">
						{state.agentName} is already the current agent
					</StatusMessage>
				);

			case "success":
				return (
					<>
						<StatusMessage type="success">
							Switched to {state.agentName}
						</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>
								Skills will now be installed to {state.agentId}'s paths.
							</Text>
						</Box>
					</>
				);

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<>
			{state.phase === "checking" && <Spinner text="Switching agent..." />}
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
