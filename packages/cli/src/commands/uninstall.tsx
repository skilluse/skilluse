import { rm } from "node:fs/promises";
import { Box, Static, Text, useApp, useInput } from "ink";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	getAgent,
	getConfig,
	getCurrentAgent,
	type InstalledSkill,
	removeInstalledSkill,
} from "../services/index.js";

export const args = z.tuple([z.string().describe("Skill name to uninstall")]);

export const options = z.object({
	force: z.boolean().default(false).describe("Skip confirmation prompt"),
});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type UninstallState =
	| { phase: "checking" }
	| { phase: "not_found"; skillName: string; agentName: string }
	| { phase: "confirming"; skill: InstalledSkill }
	| { phase: "uninstalling"; skill: InstalledSkill }
	| { phase: "success"; skill: InstalledSkill }
	| { phase: "cancelled" }
	| { phase: "error"; message: string };

function ConfirmPrompt({
	skill,
	onConfirm,
	onCancel,
}: {
	skill: InstalledSkill;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	useInput((input, key) => {
		if (input.toLowerCase() === "y" || key.return) {
			onConfirm();
		} else if (input.toLowerCase() === "n" || key.escape) {
			onCancel();
		}
	});

	return (
		<Box flexDirection="column">
			<Box>
				<Text>Uninstall </Text>
				<Text color="cyan" bold>
					{skill.name}
				</Text>
				<Text> v{skill.version}?</Text>
			</Box>
			<Box marginLeft={2}>
				<Text dimColor>Location: {skill.installedPath}</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Press </Text>
				<Text color="green">Y</Text>
				<Text dimColor> to confirm, </Text>
				<Text color="red">N</Text>
				<Text dimColor> to cancel</Text>
			</Box>
		</Box>
	);
}

export default function Uninstall({ args: [skillName], options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<UninstallState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	const performUninstall = useCallback(async (skill: InstalledSkill) => {
		setState({ phase: "uninstalling", skill });

		try {
			// Remove skill directory
			await rm(skill.installedPath, { recursive: true, force: true });

			// Remove from config
			removeInstalledSkill(skill.name);

			setState({ phase: "success", skill });
		} catch (err) {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Uninstall failed",
			});
		}
	}, []);

	useEffect(() => {
		const config = getConfig();
		const currentAgentId = getCurrentAgent();
		const agentInfo = getAgent(currentAgentId);
		const agentName = agentInfo?.name || currentAgentId;

		// Find skill matching name AND current agent
		const skill = config.installed.find(
			(s) =>
				s.name.toLowerCase() === skillName.toLowerCase() &&
				(s.agent === currentAgentId || !s.agent), // Include legacy skills without agent field
		);

		if (!skill) {
			setState({ phase: "not_found", skillName, agentName });
			return;
		}

		if (opts.force) {
			// Skip confirmation
			performUninstall(skill);
		} else {
			setState({ phase: "confirming", skill });
		}
	}, [skillName, opts.force, performUninstall]);

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

	function handleConfirm() {
		if (state.phase === "confirming") {
			performUninstall(state.skill);
		}
	}

	function handleCancel() {
		setState({ phase: "cancelled" });
	}

	const renderContent = () => {
		switch (state.phase) {
			case "not_found":
				return (
					<Box flexDirection="column">
						<StatusMessage type="error">
							Skill "{state.skillName}" is not installed for {state.agentName}
						</StatusMessage>
						<Box marginTop={1}>
							<Text dimColor>Run 'skilluse list' to see installed skills.</Text>
						</Box>
						<Box>
							<Text dimColor>
								Run 'skilluse list --all' to see skills for all agents.
							</Text>
						</Box>
					</Box>
				);

			case "success":
				return (
					<StatusMessage type="success">
						Uninstalled "{state.skill.name}"
					</StatusMessage>
				);

			case "cancelled":
				return <StatusMessage type="warning">Uninstall cancelled</StatusMessage>;

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<>
			{state.phase === "checking" && <Spinner text="Loading..." />}
			{state.phase === "confirming" && (
				<ConfirmPrompt
					skill={state.skill}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
			{state.phase === "uninstalling" && (
				<Spinner text={`Uninstalling ${state.skill.name}...`} />
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
