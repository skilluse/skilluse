import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
	Select,
	Spinner,
	StatusMessage,
} from "../../components/index.js";
import {
	type AgentConfig,
	getAgent,
	getCurrentAgent,
	listAgents,
	setCurrentAgent,
} from "../../services/index.js";

export const args = z.tuple([
	z.string().optional().describe("Agent ID to switch to"),
]);

export const options = z.object({});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type AgentState =
	| { phase: "loading" }
	| { phase: "selecting"; currentAgent: string; agents: AgentConfig[] }
	| { phase: "not_found"; agentId: string }
	| { phase: "already_current"; agentId: string; agentName: string }
	| { phase: "switched"; agentId: string; agentName: string };

export default function Agent({ args: [agentIdArg] }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<AgentState>({ phase: "loading" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		if (agentIdArg) {
			// Switch to specified agent
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
				phase: "switched",
				agentId: agentIdArg,
				agentName: agent.name,
			});
		} else {
			// Show interactive selection
			const currentAgent = getCurrentAgent();
			const agents = listAgents();
			setState({ phase: "selecting", currentAgent, agents });
		}
	}, [agentIdArg]);

	// Handle exit for non-selecting states
	useEffect(() => {
		if (
			state.phase !== "loading" &&
			state.phase !== "selecting" &&
			outputItems.length === 0
		) {
			setOutputItems([{ id: "output" }]);
		}
	}, [state.phase, outputItems.length]);

	useEffect(() => {
		if (outputItems.length > 0) {
			process.nextTick(() => exit());
		}
	}, [outputItems.length, exit]);

	const handleSelect = (item: { label: string; value: string }) => {
		const agent = getAgent(item.value);
		if (!agent) return;

		const currentAgent = getCurrentAgent();
		if (currentAgent === item.value) {
			setState({
				phase: "already_current",
				agentId: item.value,
				agentName: agent.name,
			});
			return;
		}

		setCurrentAgent(item.value);
		setState({
			phase: "switched",
			agentId: item.value,
			agentName: agent.name,
		});
	};

	const renderContent = () => {
		switch (state.phase) {
			case "selecting": {
				const items = state.agents.map((agent) => ({
					label:
						agent.id === state.currentAgent
							? `${agent.name} (current)`
							: agent.name,
					value: agent.id,
				}));

				return (
					<Box flexDirection="column">
						<Box marginBottom={1}>
							<Text bold>Select an agent:</Text>
						</Box>
						<Select items={items} onSelect={handleSelect} />
					</Box>
				);
			}

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

			case "switched":
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

			default:
				return null;
		}
	};

	if (state.phase === "loading") {
		return <Spinner text="Loading..." />;
	}

	if (state.phase === "selecting") {
		return renderContent();
	}

	return (
		<Static items={outputItems}>
			{(item) => (
				<Box key={item.id} flexDirection="column">
					{renderContent()}
				</Box>
			)}
		</Static>
	);
}
