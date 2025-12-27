import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
  getCredentials,
  getInstallations,
  getInstallationRepositories,
  type StoredInstallation,
  type Repository,
} from "../services/index.js";

export const options = z.object({
  installation: z
    .number()
    .optional()
    .describe("Filter by installation ID"),
});

interface Props {
  options: z.infer<typeof options>;
}

interface InstallationWithRepos {
  installation: StoredInstallation;
  repositories: Repository[];
}

type ReposState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "no_installations" }
  | { phase: "fetching"; current: number; total: number }
  | { phase: "success"; data: InstallationWithRepos[] }
  | { phase: "error"; message: string };

export default function Repos({ options: opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<ReposState>({ phase: "checking" });

  useEffect(() => {
    async function fetchRepos() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      // Get installations
      let installations = getInstallations();
      if (installations.length === 0) {
        setState({ phase: "no_installations" });
        exit();
        return;
      }

      // Filter by installation ID if provided
      if (opts.installation) {
        installations = installations.filter((i) => i.id === opts.installation);
        if (installations.length === 0) {
          setState({
            phase: "error",
            message: `Installation with ID ${opts.installation} not found`,
          });
          exit();
          return;
        }
      }

      // Fetch repositories for each installation
      const results: InstallationWithRepos[] = [];
      for (let i = 0; i < installations.length; i++) {
        const installation = installations[i];
        setState({ phase: "fetching", current: i + 1, total: installations.length });

        try {
          const repositories = await getInstallationRepositories(
            credentials.token,
            installation.id
          );
          results.push({ installation, repositories });
        } catch (err) {
          // Continue with other installations even if one fails
          results.push({ installation, repositories: [] });
        }
      }

      setState({ phase: "success", data: results });
      exit();
    }

    fetchRepos();
  }, [opts.installation, exit]);

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

    case "no_installations":
      return (
        <Box flexDirection="column">
          <StatusMessage type="warning">No GitHub App installations found</StatusMessage>
          <Text dimColor>Run 'skilluse login' to install the GitHub App</Text>
        </Box>
      );

    case "fetching":
      return (
        <Spinner
          text={`Fetching repositories (${state.current}/${state.total})...`}
        />
      );

    case "success":
      if (state.data.every((d) => d.repositories.length === 0)) {
        return (
          <StatusMessage type="warning">
            No accessible repositories found
          </StatusMessage>
        );
      }

      return (
        <Box flexDirection="column">
          <Text bold>Accessible Repositories:</Text>
          <Text> </Text>
          {state.data.map(({ installation, repositories }) => (
            <Box key={installation.id} flexDirection="column" marginBottom={1}>
              <Text bold>
                {installation.account}{" "}
                <Text dimColor>({installation.accountType.toLowerCase()})</Text>:
              </Text>
              {repositories.length === 0 ? (
                <Text dimColor>  (no repositories accessible)</Text>
              ) : (
                repositories.map((repo) => (
                  <Text key={repo.id} dimColor>
                    • {repo.full_name} ({repo.private ? "private" : "public"})
                  </Text>
                ))
              )}
            </Box>
          ))}
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
