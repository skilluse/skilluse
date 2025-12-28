import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
  getCredentials,
  addRepo,
  setDefaultRepo,
  getConfig,
} from "../../services/index.js";

export const args = z.tuple([z.string().describe("Repository in owner/repo format")]);

export const options = z.object({
  path: z
    .string()
    .optional()
    .describe("Skill path within the repo (e.g., skills/)"),
  branch: z
    .string()
    .default("main")
    .describe("Branch to use"),
  default: z
    .boolean()
    .default(false)
    .describe("Set as default repo"),
});

interface Props {
  args: z.infer<typeof args>;
  options: z.infer<typeof options>;
}

type AddState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "invalid_repo" }
  | { phase: "already_exists"; repo: string }
  | { phase: "input_path"; repo: string; currentPath: string }
  | { phase: "saving"; repo: string }
  | { phase: "success"; repo: string; path: string; isDefault: boolean }
  | { phase: "error"; message: string };

export default function RepoAdd({ args: [repoArg], options: opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<AddState>({ phase: "checking" });

  useEffect(() => {
    async function checkAndAdd() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      // Validate repo format
      if (!repoArg.match(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/)) {
        setState({ phase: "invalid_repo" });
        exit();
        return;
      }

      // Check if already exists
      const config = getConfig();
      if (config.repos.find((r) => r.repo === repoArg)) {
        setState({ phase: "already_exists", repo: repoArg });
        exit();
        return;
      }

      // If path is provided via --path, save directly
      if (opts.path !== undefined) {
        setState({ phase: "saving", repo: repoArg });

        const paths = opts.path ? [opts.path] : [];
        addRepo({
          repo: repoArg,
          branch: opts.branch,
          paths,
        });

        // Set as default if requested or if first repo
        const isDefault = opts.default || config.repos.length === 0;
        if (isDefault) {
          setDefaultRepo(repoArg);
        }

        setState({
          phase: "success",
          repo: repoArg,
          path: opts.path || "(all paths)",
          isDefault,
        });
        exit();
        return;
      }

      // Interactive mode: prompt for path
      setState({ phase: "input_path", repo: repoArg, currentPath: "" });
    }

    checkAndAdd();
  }, [repoArg, opts.path, opts.branch, opts.default, exit]);

  // Handle input for path
  useInput(
    (input, key) => {
      if (state.phase !== "input_path") return;

      if (key.return) {
        // Save with current path
        const config = getConfig();
        const paths = state.currentPath ? [state.currentPath] : [];

        addRepo({
          repo: state.repo,
          branch: opts.branch,
          paths,
        });

        const isDefault = opts.default || config.repos.length === 0;
        if (isDefault) {
          setDefaultRepo(state.repo);
        }

        setState({
          phase: "success",
          repo: state.repo,
          path: state.currentPath || "(all paths)",
          isDefault,
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

    case "invalid_repo":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">Invalid repository format</StatusMessage>
          <Text dimColor>Use the format: owner/repo</Text>
        </Box>
      );

    case "already_exists":
      return (
        <Box flexDirection="column">
          <StatusMessage type="warning">
            Repository {state.repo} is already configured
          </StatusMessage>
          <Text dimColor>Use 'skilluse repo edit {state.repo}' to modify it.</Text>
        </Box>
      );

    case "input_path":
      return (
        <Box flexDirection="column">
          <Text>Adding repository: <Text color="cyan">{state.repo}</Text></Text>
          <Box marginTop={1}>
            <Text>Skill path (leave empty for all): </Text>
            <Text color="green">{state.currentPath}</Text>
            <Text color="gray">█</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to confirm, Esc to cancel</Text>
          </Box>
        </Box>
      );

    case "saving":
      return <Spinner text={`Adding ${state.repo}...`} />;

    case "success":
      return (
        <Box flexDirection="column">
          <StatusMessage type="success">
            Added {state.repo}
          </StatusMessage>
          <Text dimColor>Path: {state.path}</Text>
          {state.isDefault && <Text dimColor>Set as default repository</Text>}
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
