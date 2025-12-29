import { Box, Text, useApp } from "ink";
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

	useEffect(() => {
		async function switchAgent() {
			// Check if agent exists
			const agent = getAgent(agentIdArg);
			if (!agent) {
				setState({ phase: "not_found", agentId: agentIdArg });
				await new Promise((resolve) => setTimeout(resolve, 50));
				exit();
				return;
			}

			// Check if already current
			const currentAgent = getCurrentAgent();
			if (currentAgent === agentIdArg) {
				setState({
					phase: "already_current",
					agentId: agentIdArg,
					agentName: agent.name,
				});
				await new Promise((resolve) => setTimeout(resolve, 50));
				exit();
				return;
			}

			// Set as current
			setCurrentAgent(agentIdArg);
			setState({
				phase: "success",
				agentId: agentIdArg,
				agentName: agent.name,
			});
			await new Promise((resolve) => setTimeout(resolve, 50));
			exit();
		}
		switchAgent();
	}, [agentIdArg, exit]);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Switching agent..." />;

		case "not_found":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">
						Unknown agent: {state.agentId}
					</StatusMessage>
					<Text dimColor>Run 'skilluse agent' to see available agents.</Text>
				</Box>
			);

		case "already_current":
			return (
				<StatusMessage type="success">
					{state.agentName} is already the current agent
				</StatusMessage>
			);

		case "success":
			return (
				<Box flexDirection="column">
					<StatusMessage type="success">
						Switched to {state.agentName}
					</StatusMessage>
					<Box marginTop={1}>
						<Text dimColor>
							Skills will now be installed to {state.agentId}'s paths.
						</Text>
					</Box>
				</Box>
			);

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
