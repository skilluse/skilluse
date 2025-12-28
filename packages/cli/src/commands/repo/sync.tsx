import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
  getCredentials,
  getConfig,
} from "../../services/index.js";

export const args = z.tuple([
  z.string().optional().describe("Repository in owner/repo format (optional, syncs all if omitted)"),
]);

export const options = z.object({});

interface Props {
  args: z.infer<typeof args>;
  options: z.infer<typeof options>;
}

type SyncState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "no_repos" }
  | { phase: "not_found"; repo: string }
  | { phase: "syncing"; repo: string; current: number; total: number }
  | { phase: "success"; synced: string[] }
  | { phase: "error"; message: string };

export default function RepoSync({ args: [repoArg], options: _opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<SyncState>({ phase: "checking" });

  useEffect(() => {
    async function syncRepos() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      const config = getConfig();

      if (config.repos.length === 0) {
        setState({ phase: "no_repos" });
        exit();
        return;
      }

      // If specific repo provided, check it exists
      if (repoArg) {
        if (!config.repos.find((r) => r.repo === repoArg)) {
          setState({ phase: "not_found", repo: repoArg });
          exit();
          return;
        }
      }

      // Get repos to sync
      const reposToSync = repoArg
        ? config.repos.filter((r) => r.repo === repoArg)
        : config.repos;

      // Sync each repo
      const synced: string[] = [];
      for (let i = 0; i < reposToSync.length; i++) {
        const repo = reposToSync[i];
        setState({
          phase: "syncing",
          repo: repo.repo,
          current: i + 1,
          total: reposToSync.length,
        });

        // TODO: Implement actual sync logic (fetch skill manifest from GitHub)
        // For now, just simulate a sync
        await new Promise((resolve) => setTimeout(resolve, 500));
        synced.push(repo.repo);
      }

      setState({ phase: "success", synced });
      exit();
    }

    syncRepos();
  }, [repoArg, exit]);

  switch (state.phase) {
    case "checking":
      return <Spinner text="Checking..." />;

    case "not_logged_in":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">Not authenticated</StatusMessage>
          <Text dimColor>Run 'skilluse login' to authenticate with GitHub</Text>
        </Box>
      );

    case "no_repos":
      return (
        <Box flexDirection="column">
          <StatusMessage type="warning">No repositories configured</StatusMessage>
          <Text dimColor>Run 'skilluse repo add owner/repo' to add one.</Text>
        </Box>
      );

    case "not_found":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">
            Repository {state.repo} not found in config
          </StatusMessage>
          <Text dimColor>Run 'skilluse repo list' to see configured repos.</Text>
        </Box>
      );

    case "syncing":
      return (
        <Spinner
          text={`Syncing ${state.repo} (${state.current}/${state.total})...`}
        />
      );

    case "success":
      return (
        <Box flexDirection="column">
          <StatusMessage type="success">
            Synced {state.synced.length} repo{state.synced.length > 1 ? "s" : ""}
          </StatusMessage>
          {state.synced.map((repo) => (
            <Text key={repo} dimColor>
              • {repo}
            </Text>
          ))}
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
