import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { z } from "zod";
import { rm } from "fs/promises";
import { StatusMessage, Spinner } from "../components/index.js";
import {
  getConfig,
  removeInstalledSkill,
  type InstalledSkill,
} from "../services/index.js";

export const args = z.tuple([z.string().describe("Skill name to uninstall")]);

export const options = z.object({
  force: z
    .boolean()
    .default(false)
    .describe("Skip confirmation prompt"),
});

interface Props {
  args: z.infer<typeof args>;
  options: z.infer<typeof options>;
}

type UninstallState =
  | { phase: "checking" }
  | { phase: "not_found"; skillName: string }
  | { phase: "confirming"; skill: InstalledSkill }
  | { phase: "uninstalling"; skill: InstalledSkill }
  | { phase: "success"; skill: InstalledSkill }
  | { phase: "cancelled" }
  | { phase: "error"; message: string };

function ConfirmPrompt({
  skill,
  onConfirm,
  onCancel,
}: {
  skill: InstalledSkill;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useInput((input, key) => {
    if (input.toLowerCase() === "y" || key.return) {
      onConfirm();
    } else if (input.toLowerCase() === "n" || key.escape) {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text>Uninstall </Text>
        <Text color="cyan" bold>{skill.name}</Text>
        <Text> v{skill.version}?</Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>Location: {skill.installedPath}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press </Text>
        <Text color="green">Y</Text>
        <Text dimColor> to confirm, </Text>
        <Text color="red">N</Text>
        <Text dimColor> to cancel</Text>
      </Box>
    </Box>
  );
}

export default function Uninstall({ args: [skillName], options: opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<UninstallState>({ phase: "checking" });

  useEffect(() => {
    const config = getConfig();
    const skill = config.installed.find(
      (s) => s.name.toLowerCase() === skillName.toLowerCase()
    );

    if (!skill) {
      setState({ phase: "not_found", skillName });
      exit();
      return;
    }

    if (opts.force) {
      // Skip confirmation
      performUninstall(skill);
    } else {
      setState({ phase: "confirming", skill });
    }
  }, [skillName, opts.force, exit]);

  async function performUninstall(skill: InstalledSkill) {
    setState({ phase: "uninstalling", skill });

    try {
      // Remove skill directory
      await rm(skill.installedPath, { recursive: true, force: true });

      // Remove from config
      removeInstalledSkill(skill.name);

      setState({ phase: "success", skill });
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Uninstall failed",
      });
    }

    exit();
  }

  function handleConfirm() {
    if (state.phase === "confirming") {
      performUninstall(state.skill);
    }
  }

  function handleCancel() {
    setState({ phase: "cancelled" });
    exit();
  }

  switch (state.phase) {
    case "checking":
      return <Spinner text="Loading..." />;

    case "not_found":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">
            Skill "{state.skillName}" is not installed
          </StatusMessage>
          <Box marginTop={1}>
            <Text dimColor>Run 'skilluse list' to see installed skills.</Text>
          </Box>
        </Box>
      );

    case "confirming":
      return (
        <ConfirmPrompt
          skill={state.skill}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

    case "uninstalling":
      return <Spinner text={`Uninstalling ${state.skill.name}...`} />;

    case "success":
      return (
        <StatusMessage type="success">
          Uninstalled "{state.skill.name}"
        </StatusMessage>
      );

    case "cancelled":
      return (
        <StatusMessage type="warning">Uninstall cancelled</StatusMessage>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
