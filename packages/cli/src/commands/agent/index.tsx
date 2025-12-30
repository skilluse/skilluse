import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, Table } from "../../components/index.js";
import {
	type AgentConfig,
	getCurrentAgent,
	listAgents,
} from "../../services/index.js";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

type AgentState =
	| { phase: "loading" }
	| { phase: "success"; currentAgent: string; agents: AgentConfig[] };

export default function Agent(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<AgentState>({ phase: "loading" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		const currentAgent = getCurrentAgent();
		const agents = listAgents();
		setState({ phase: "success", currentAgent, agents });
	}, []);

	useEffect(() => {
		if (state.phase === "success" && outputItems.length === 0) {
			setOutputItems([{ id: "output" }]);
		}
	}, [state.phase, outputItems.length]);

	useEffect(() => {
		if (outputItems.length > 0) {
			process.nextTick(() => exit());
		}
	}, [outputItems.length, exit]);

	const renderContent = () => {
		if (state.phase !== "success") return null;

		const tableData = state.agents.map((agent) => ({
			id: agent.id,
			name: agent.name,
			description: agent.description,
			current: agent.id === state.currentAgent ? "*" : "",
		}));

		return (
			<>
				<Box marginBottom={1}>
					<Text bold>Supported Agents</Text>
				</Box>
				<Table
					data={tableData}
					columns={["current", "id", "name", "description"]}
				/>
				<Box marginTop={1}>
					<Text dimColor>
						Current: <Text color="cyan">{state.currentAgent}</Text>
					</Text>
				</Box>
				<Box>
					<Text dimColor>
						Run 'skilluse agent use &lt;id&gt;' to switch agents.
					</Text>
				</Box>
			</>
		);
	};

	return (
		<>
			{state.phase === "loading" && <Spinner text="Loading agents..." />}
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
