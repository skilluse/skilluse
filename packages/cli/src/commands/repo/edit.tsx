import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
  getCredentials,
  addRepo,
  getConfig,
  type RepoConfig,
} from "../../services/index.js";

export const args = z.tuple([z.string().describe("Repository in owner/repo format")]);

export const options = z.object({
  path: z
    .string()
    .optional()
    .describe("New skill path within the repo"),
  branch: z
    .string()
    .optional()
    .describe("New branch to use"),
});

interface Props {
  args: z.infer<typeof args>;
  options: z.infer<typeof options>;
}

type EditState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "not_found"; repo: string }
  | { phase: "input_path"; repo: string; existingConfig: RepoConfig; currentPath: string }
  | { phase: "success"; repo: string; path: string }
  | { phase: "error"; message: string };

export default function RepoEdit({ args: [repoArg], options: opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<EditState>({ phase: "checking" });

  useEffect(() => {
    async function checkAndEdit() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      // Check if repo exists
      const config = getConfig();
      const existingConfig = config.repos.find((r) => r.repo === repoArg);
      if (!existingConfig) {
        setState({ phase: "not_found", repo: repoArg });
        exit();
        return;
      }

      // If path or branch provided via flags, update directly
      if (opts.path !== undefined || opts.branch !== undefined) {
        const updatedConfig: RepoConfig = {
          repo: repoArg,
          branch: opts.branch || existingConfig.branch,
          paths: opts.path !== undefined ? (opts.path ? [opts.path] : []) : existingConfig.paths,
        };

        addRepo(updatedConfig);
        setState({
          phase: "success",
          repo: repoArg,
          path: updatedConfig.paths.length > 0 ? updatedConfig.paths.join(", ") : "(all paths)",
        });
        exit();
        return;
      }

      // Interactive mode: prompt for new path
      setState({
        phase: "input_path",
        repo: repoArg,
        existingConfig,
        currentPath: existingConfig.paths.length > 0 ? existingConfig.paths[0] : "",
      });
    }

    checkAndEdit();
  }, [repoArg, opts.path, opts.branch, exit]);

  // Handle input for path
  useInput(
    (input, key) => {
      if (state.phase !== "input_path") return;

      if (key.return) {
        const updatedConfig: RepoConfig = {
          repo: state.repo,
          branch: state.existingConfig.branch,
          paths: state.currentPath ? [state.currentPath] : [],
        };

        addRepo(updatedConfig);
        setState({
          phase: "success",
          repo: state.repo,
          path: state.currentPath || "(all paths)",
        });
        exit();
        return;
      }

      if (key.backspace || key.delete) {
        setState({
          ...state,
          currentPath: state.currentPath.slice(0, -1),
        });
        return;
      }

      if (key.escape) {
        exit();
        return;
      }

      // Add character
      if (input && !key.ctrl && !key.meta) {
        setState({
          ...state,
          currentPath: state.currentPath + input,
        });
      }
    },
    { isActive: state.phase === "input_path" }
  );

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

    case "not_found":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">
            Repository {state.repo} not found in config
          </StatusMessage>
          <Text dimColor>Run 'skilluse repo add {state.repo}' to add it first.</Text>
        </Box>
      );

    case "input_path":
      return (
        <Box flexDirection="column">
          <Text>Editing repository: <Text color="cyan">{state.repo}</Text></Text>
          <Text dimColor>Current: {state.existingConfig.paths.join(", ") || "(all paths)"}</Text>
          <Box marginTop={1}>
            <Text>New path (leave empty for all): </Text>
            <Text color="green">{state.currentPath}</Text>
            <Text color="gray">█</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to confirm, Esc to cancel</Text>
          </Box>
        </Box>
      );

    case "success":
      return (
        <Box flexDirection="column">
          <StatusMessage type="success">
            Updated {state.repo}
          </StatusMessage>
          <Text dimColor>Path: {state.path}</Text>
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
