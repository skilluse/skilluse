import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
  getCredentials,
  getConfig,
  type InstalledSkill,
} from "../services/index.js";

export const options = z.object({});

interface Props {
  options: z.infer<typeof options>;
}

type SkillsState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "success"; skills: InstalledSkill[] }
  | { phase: "error"; message: string };

/**
 * Alias for `skilluse list` - shows installed skills
 */
export default function Skills(_props: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<SkillsState>({ phase: "checking" });

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
      setState({ phase: "success", skills: config.installed });
      exit();
    }

    loadSkills();
  }, [exit]);

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
