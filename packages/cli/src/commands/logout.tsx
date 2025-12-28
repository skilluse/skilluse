import { useApp } from "ink";
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

	useEffect(() => {
		async function runLogout() {
			// Check if logged in
			const existing = await getCredentials();
			if (!existing) {
				setState({ phase: "not_logged_in" });
				exit();
				return;
			}

			// Clear all credentials (user token, token cache) and installations
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

			exit();
		}

		runLogout();
	}, [exit]);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Logging out..." />;

		case "not_logged_in":
			return <StatusMessage type="warning">Not logged in</StatusMessage>;

		case "success":
			return (
				<StatusMessage type="success">Logged out successfully</StatusMessage>
			);

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
