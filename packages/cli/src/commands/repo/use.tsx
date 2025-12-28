import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../../components/index.js";
import {
  getCredentials,
  setDefaultRepo,
  getConfig,
} from "../../services/index.js";

export const args = z.tuple([z.string().describe("Repository in owner/repo format")]);

export const options = z.object({});

interface Props {
  args: z.infer<typeof args>;
  options: z.infer<typeof options>;
}

type UseState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "not_found"; repo: string }
  | { phase: "already_default"; repo: string }
  | { phase: "success"; repo: string }
  | { phase: "error"; message: string };

export default function RepoUse({ args: [repoArg], options: _opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<UseState>({ phase: "checking" });

  useEffect(() => {
    async function setDefault() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      // Check if repo exists in config
      const config = getConfig();
      if (!config.repos.find((r) => r.repo === repoArg)) {
        setState({ phase: "not_found", repo: repoArg });
        exit();
        return;
      }

      // Check if already default
      if (config.defaultRepo === repoArg) {
        setState({ phase: "already_default", repo: repoArg });
        exit();
        return;
      }

      // Set as default
      setDefaultRepo(repoArg);
      setState({ phase: "success", repo: repoArg });
      exit();
    }

    setDefault();
  }, [repoArg, exit]);

  switch (state.phase) {
    case "checking":
      return <Spinner text="Setting default..." />;

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

    case "already_default":
      return (
        <StatusMessage type="success">
          {state.repo} is already the default
        </StatusMessage>
      );

    case "success":
      return (
        <StatusMessage type="success">
          Default repo set to {state.repo}
        </StatusMessage>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
