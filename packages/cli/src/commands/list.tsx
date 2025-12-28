import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
  getCredentials,
  getConfig,
  type InstalledSkill,
} from "../services/index.js";

export const options = z.object({
  outdated: z
    .boolean()
    .default(false)
    .describe("Show only outdated skills"),
});

interface Props {
  options: z.infer<typeof options>;
}

type ListState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "success"; skills: InstalledSkill[] }
  | { phase: "error"; message: string };

export default function List({ options: opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<ListState>({ phase: "checking" });

  useEffect(() => {
    async function loadSkills() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      const config = getConfig();
      let skills = config.installed;

      // Filter for outdated if requested (placeholder - would need version checking)
      if (opts.outdated) {
        // TODO: Implement actual outdated check against remote versions
        skills = [];
      }

      setState({ phase: "success", skills });
      exit();
    }

    loadSkills();
  }, [opts.outdated, exit]);

  switch (state.phase) {
    case "checking":
      return <Spinner text="Loading..." />;

    case "not_logged_in":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">Not authenticated</StatusMessage>
          <Text dimColor>Run 'skilluse login' to authenticate with GitHub</Text>
        </Box>
      );

    case "success":
      if (state.skills.length === 0) {
        if (opts.outdated) {
          return (
            <Box flexDirection="column">
              <StatusMessage type="success">All skills are up to date</StatusMessage>
            </Box>
          );
        }
        return (
          <Box flexDirection="column">
            <Text bold>Installed Skills</Text>
            <Box marginTop={1}>
              <Text dimColor>(no skills installed)</Text>
            </Box>
            <Box marginTop={1}>
              <Text dimColor>Run 'skilluse install skill-name' to install one.</Text>
            </Box>
          </Box>
        );
      }

      return (
        <Box flexDirection="column">
          <Text bold>Installed Skills</Text>
          <Text> </Text>
          {state.skills.map((skill) => (
            <Box key={skill.name} flexDirection="column" marginBottom={1}>
              <Box>
                <Text color="cyan" bold>
                  {skill.name}
                </Text>
                <Text dimColor> v{skill.version}</Text>
                <Text dimColor> ({skill.scope})</Text>
              </Box>
              <Box marginLeft={2}>
                <Text dimColor>
                  From: {skill.repo} | Path: {skill.installedPath}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
