import { Box, Text, useApp } from "ink";
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

	useEffect(() => {
		async function loadAgents() {
			const currentAgent = getCurrentAgent();
			const agents = listAgents();
			setState({ phase: "success", currentAgent, agents });
			// Small delay to allow ink to render
			await new Promise((resolve) => setTimeout(resolve, 50));
			exit();
		}
		loadAgents();
	}, [exit]);

	switch (state.phase) {
		case "loading":
			return <Spinner text="Loading agents..." />;

		case "success": {
			const tableData = state.agents.map((agent) => ({
				id: agent.id,
				name: agent.name,
				description: agent.description,
				current: agent.id === state.currentAgent ? "*" : "",
			}));

			return (
				<Box flexDirection="column">
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
				</Box>
			);
		}
	}
}
