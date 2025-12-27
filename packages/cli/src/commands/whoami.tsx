import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
  getCredentials,
  getInstallations,
  type StoredInstallation,
} from "../services/index.js";

export const options = z.object({});

interface Props {
  options: z.infer<typeof options>;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

type WhoamiState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "logged_in"; user: GitHubUser; installations: StoredInstallation[] }
  | { phase: "error"; message: string };

export default function Whoami(_props: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<WhoamiState>({ phase: "checking" });

  useEffect(() => {
    async function checkAuth() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      // Fetch fresh user info from GitHub
      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${credentials.token}`,
            Accept: "application/vnd.github+json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setState({
              phase: "error",
              message: "Token expired or invalid. Please run 'skilluse login' again.",
            });
          } else {
            setState({
              phase: "error",
              message: `GitHub API error: ${response.status}`,
            });
          }
          exit();
          return;
        }

        const userData = (await response.json()) as GitHubUser;
        const installations = getInstallations();
        setState({ phase: "logged_in", user: userData, installations });
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Failed to fetch user info",
        });
      }

      exit();
    }

    checkAuth();
  }, [exit]);

  switch (state.phase) {
    case "checking":
      return <Spinner text="Checking authentication..." />;

    case "not_logged_in":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">Not authenticated</StatusMessage>
          <Text dimColor>Run 'skilluse login' to authenticate with GitHub</Text>
        </Box>
      );

    case "logged_in":
      return (
        <Box flexDirection="column">
          <Box>
            <Text>Logged in as </Text>
            <Text color="green" bold>
              {state.user.login}
            </Text>
            {state.user.name && (
              <Text dimColor> ({state.user.name})</Text>
            )}
          </Box>
          <Text dimColor>{state.user.html_url}</Text>
          {state.installations.length > 0 && (
            <Box marginTop={1} flexDirection="column">
              <Text>GitHub App Installations:</Text>
              {state.installations.map((inst) => (
                <Text key={inst.id} dimColor>
                  • {inst.account} ({inst.accountType.toLowerCase()}) -{" "}
                  {inst.repositorySelection === "all" ? "all repositories" : "selected repositories"}
                </Text>
              ))}
              <Box marginTop={1}>
                <Text dimColor>Use 'skilluse repos' to see accessible repositories.</Text>
              </Box>
            </Box>
          )}
          {state.installations.length === 0 && (
            <Box marginTop={1}>
              <Text color="yellow">No GitHub App installations found.</Text>
            </Box>
          )}
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
