import { Box, Static, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	clearAllCredentials,
	clearInstallations,
	getCredentials,
} from "../services/index.js";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

type LogoutState =
	| { phase: "checking" }
	| { phase: "not_logged_in" }
	| { phase: "success" }
	| { phase: "error"; message: string };

export default function Logout(_props: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<LogoutState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		async function runLogout() {
			const existing = await getCredentials();
			if (!existing) {
				setState({ phase: "not_logged_in" });
				return;
			}

			try {
				await clearAllCredentials();
				clearInstallations();
				setState({ phase: "success" });
			} catch (err) {
				setState({
					phase: "error",
					message:
						err instanceof Error ? err.message : "Failed to clear credentials",
				});
			}
		}

		runLogout();
	}, []);

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
			case "not_logged_in":
				return <StatusMessage type="warning">Not logged in</StatusMessage>;

			case "success":
				return (
					<StatusMessage type="success">Logged out successfully</StatusMessage>
				);

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<>
			{state.phase === "checking" && <Spinner text="Logging out..." />}
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
