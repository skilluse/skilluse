import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
  requestDeviceCode,
  pollUntilComplete,
  openBrowser,
  getCredentials,
  setCredentials,
} from "../services/index.js";

// GitHub OAuth App Client ID for Skilluse CLI
// Users can override with SKILLUSE_GITHUB_CLIENT_ID environment variable
const GITHUB_CLIENT_ID = process.env.SKILLUSE_GITHUB_CLIENT_ID || "Ov23likh3P4o2wzi8nJZ";

export const options = z.object({
  force: z
    .boolean()
    .default(false)
    .describe("Force re-authentication even if already logged in"),
});

interface Props {
  options: z.infer<typeof options>;
}

type LoginState =
  | { phase: "checking" }
  | { phase: "already_logged_in"; username: string }
  | { phase: "requesting_code" }
  | { phase: "waiting_for_auth"; userCode: string; verificationUri: string }
  | { phase: "success"; username: string }
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

      let deviceCode;
      try {
        deviceCode = await requestDeviceCode(GITHUB_CLIENT_ID, "repo,user");
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Failed to start authentication",
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
        deviceCode.interval
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
      try {
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${result.token.access_token}`,
            Accept: "application/vnd.github+json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userData = (await userResponse.json()) as { login: string };
        username = userData.login;
      } catch {
        setState({ phase: "error", message: "Failed to fetch user info from GitHub" });
        exit();
        return;
      }

      // Store credentials
      await setCredentials(result.token.access_token, username);

      setState({ phase: "success", username });
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

    case "success":
      return (
        <StatusMessage type="success">
          Logged in as {state.username}
        </StatusMessage>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
