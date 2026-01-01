import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	type DeviceCodeResponse,
	getCredentials,
	getUserInstallations,
	type Installation,
	openBrowser,
	pollUntilComplete,
	requestDeviceCode,
	type StoredInstallation,
	setCredentials,
	setDefaultInstallation,
	setInstallations,
} from "../services/index.js";

// GitHub App Client ID for Skilluse CLI
// These are public values, safe to embed in client code
// Override with SKILLUSE_GITHUB_CLIENT_ID env var for development
const GITHUB_CLIENT_ID =
	process.env.SKILLUSE_GITHUB_CLIENT_ID || "Iv23liOOBSjdH2IRT6W2";

export const options = z.object({});

interface Props {
	options: z.infer<typeof options>;
}

type LoginState =
	| { phase: "checking" }
	| { phase: "already_logged_in"; username: string }
	| { phase: "requesting_code" }
	| { phase: "waiting_for_auth"; userCode: string; verificationUri: string }
	| { phase: "fetching_installations" }
	| { phase: "no_installation"; installUrl: string }
	| { phase: "success"; username: string; installations: StoredInstallation[] }
	| { phase: "error"; message: string };

export default function Login({ options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<LoginState>({ phase: "checking" });

	useEffect(() => {
		async function runLogin() {
			// Check if already logged in
			if (!opts.force) {
				const existing = await getCredentials();
				if (existing) {
					setState({ phase: "already_logged_in", username: existing.user });
					exit();
					return;
				}
			}

			// Request device code
			setState({ phase: "requesting_code" });

			let deviceCode: DeviceCodeResponse;
			try {
				deviceCode = await requestDeviceCode(GITHUB_CLIENT_ID, "repo,user");
			} catch (err) {
				setState({
					phase: "error",
					message:
						err instanceof Error
							? err.message
							: "Failed to start authentication",
				});
				exit();
				return;
			}

			// Show user code and open browser
			setState({
				phase: "waiting_for_auth",
				userCode: deviceCode.user_code,
				verificationUri: deviceCode.verification_uri,
			});

			// Try to open browser automatically
			try {
				await openBrowser(deviceCode.verification_uri);
			} catch {
				// Browser opening failed, user will need to open manually
			}

			// Poll for access token
			const result = await pollUntilComplete(
				GITHUB_CLIENT_ID,
				deviceCode.device_code,
				deviceCode.expires_in,
				deviceCode.interval,
			);

			if (!result.success) {
				const messages: Record<string, string> = {
					expired: "Authentication timed out. Please try again.",
					denied: "Authentication was denied.",
					error: result.message || "Authentication failed.",
				};
				setState({ phase: "error", message: messages[result.reason] });
				exit();
				return;
			}

			// Fetch user info from GitHub
			let username: string;
			const accessToken = result.token.access_token;
			try {
				const userResponse = await fetch("https://api.github.com/user", {
					headers: {
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github+json",
					},
				});

				if (!userResponse.ok) {
					throw new Error("Failed to fetch user info");
				}

				const userData = (await userResponse.json()) as { login: string };
				username = userData.login;
			} catch {
				setState({
					phase: "error",
					message: "Failed to fetch user info from GitHub",
				});
				exit();
				return;
			}

			// Store credentials
			await setCredentials(accessToken, username);

			// Fetch GitHub App installations
			setState({ phase: "fetching_installations" });

			let installations: Installation[];
			try {
				installations = await getUserInstallations(accessToken);
			} catch (_err) {
				// If we can't fetch installations, show prompt to install
				setState({
					phase: "no_installation",
					installUrl: "https://github.com/apps/skilluse/installations/new",
				});
				exit();
				return;
			}

			if (installations.length === 0) {
				// No installations, prompt user to install
				setState({
					phase: "no_installation",
					installUrl: "https://github.com/apps/skilluse/installations/new",
				});
				exit();
				return;
			}

			// Convert to StoredInstallation and save
			const storedInstallations: StoredInstallation[] = installations.map(
				(inst) => ({
					id: inst.id,
					account: inst.account.login,
					accountType: inst.account.type,
					repositorySelection: inst.repository_selection,
				}),
			);

			await setInstallations(storedInstallations);

			// If single installation, set as default
			if (storedInstallations.length === 1) {
				await setDefaultInstallation(storedInstallations[0].id);
			}

			setState({
				phase: "success",
				username,
				installations: storedInstallations,
			});
			exit();
		}

		runLogin();
	}, [opts.force, exit]);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Checking authentication status..." />;

		case "already_logged_in":
			return (
				<Box flexDirection="column">
					<StatusMessage type="success">
						Already logged in as {state.username}
					</StatusMessage>
					<Text dimColor>Use --force to re-authenticate</Text>
				</Box>
			);

		case "requesting_code":
			return <Spinner text="Starting authentication..." />;

		case "waiting_for_auth":
			return (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text>Open </Text>
						<Text color="cyan" bold>
							{state.verificationUri}
						</Text>
						<Text> and enter code:</Text>
					</Box>
					<Box marginBottom={1}>
						<Text color="yellow" bold>
							{state.userCode}
						</Text>
					</Box>
					<Spinner text="Waiting for authentication..." />
				</Box>
			);

		case "fetching_installations":
			return <Spinner text="Fetching GitHub App installations..." />;

		case "no_installation":
			return (
				<Box flexDirection="column">
					<StatusMessage type="warning">
						You need to install Skilluse CLI on your GitHub account
					</StatusMessage>
					<Box marginTop={1}>
						<Text>Open: </Text>
						<Text color="cyan" bold>
							{state.installUrl}
						</Text>
					</Box>
					<Box marginTop={1}>
						<Text dimColor>Then run 'skilluse login' again.</Text>
					</Box>
				</Box>
			);

		case "success":
			return (
				<Box flexDirection="column">
					<StatusMessage type="success">
						Logged in as {state.username}
					</StatusMessage>
					{state.installations.length > 0 && (
						<Box marginTop={1} flexDirection="column">
							<Text dimColor>
								{state.installations.length} installation
								{state.installations.length > 1 ? "s" : ""} found:
							</Text>
							{state.installations.map((inst) => (
								<Text key={inst.id} dimColor>
									• {inst.account} ({inst.accountType.toLowerCase()})
								</Text>
							))}
						</Box>
					)}
				</Box>
			);

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
