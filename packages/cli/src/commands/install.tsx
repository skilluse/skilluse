import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { Spinner, StatusMessage, ProgressBar } from "../components/index.js";
import {
  getCredentials,
  getConfig,
  addInstalledSkill,
  type RepoConfig,
  type InstalledSkill,
} from "../services/index.js";

export const args = z.tuple([z.string().describe("Skill name to install")]);

export const options = z.object({
  global: z
    .boolean()
    .default(false)
    .describe("Install globally to ~/.claude/skills/"),
});

interface Props {
  args: z.infer<typeof args>;
  options: z.infer<typeof options>;
}

interface SkillMetadata {
  name: string;
  description: string;
  type?: string;
  version?: string;
  author?: string;
  repo: string;
  path: string;
}

interface InstallStep {
  label: string;
  status: "pending" | "in_progress" | "done" | "error";
}

type InstallState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "no_repos" }
  | { phase: "searching"; repo: string }
  | { phase: "not_found"; skillName: string }
  | { phase: "conflict"; skillName: string; sources: Array<{ repo: string; path: string }> }
  | {
      phase: "installing";
      skill: SkillMetadata;
      scope: "local" | "global";
      steps: InstallStep[];
      progress: number;
    }
  | { phase: "success"; skill: SkillMetadata; installedPath: string }
  | { phase: "error"; message: string };

/**
 * Parse YAML frontmatter from SKILL.md content
 */
function parseFrontmatter(content: string): Record<string, unknown> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const yaml = frontmatterMatch[1];
  const result: Record<string, unknown> = {};

  const lines = yaml.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: unknown = line.substring(colonIndex + 1).trim();

    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim());
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Find a skill by name in configured repos
 */
async function findSkill(
  token: string,
  repos: RepoConfig[],
  skillName: string
): Promise<Array<{ skill: SkillMetadata; commitSha: string }>> {
  const results: Array<{ skill: SkillMetadata; commitSha: string }> = [];

  for (const repoConfig of repos) {
    const { repo, branch, paths: searchPaths } = repoConfig;
    const basePaths = searchPaths.length > 0 ? searchPaths : [""];

    for (const basePath of basePaths) {
      try {
        // Get directory contents
        const apiPath = basePath
          ? `https://api.github.com/repos/${repo}/contents/${basePath}?ref=${branch}`
          : `https://api.github.com/repos/${repo}/contents?ref=${branch}`;

        const response = await fetch(apiPath, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        if (!response.ok) continue;

        const contents = (await response.json()) as Array<{
          name: string;
          path: string;
          type: string;
        }>;

        // Look for directories matching skill name
        const dirs = contents.filter(
          (item) => item.type === "dir" && item.name.toLowerCase() === skillName.toLowerCase()
        );

        for (const dir of dirs) {
          // Fetch SKILL.md
          const skillMdUrl = `https://api.github.com/repos/${repo}/contents/${dir.path}/SKILL.md?ref=${branch}`;
          const skillResponse = await fetch(skillMdUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.raw+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          });

          if (skillResponse.ok) {
            const content = await skillResponse.text();
            const frontmatter = parseFrontmatter(content);

            // Get the commit SHA for this ref
            const refUrl = `https://api.github.com/repos/${repo}/commits/${branch}`;
            const refResponse = await fetch(refUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
              },
            });

            let commitSha = branch;
            if (refResponse.ok) {
              const refData = (await refResponse.json()) as { sha: string };
              commitSha = refData.sha;
            }

            results.push({
              skill: {
                name: String(frontmatter.name || dir.name),
                description: String(frontmatter.description || ""),
                type: frontmatter.type ? String(frontmatter.type) : undefined,
                version: frontmatter.version ? String(frontmatter.version) : "1.0.0",
                author: frontmatter.author ? String(frontmatter.author) : undefined,
                repo,
                path: dir.path,
              },
              commitSha,
            });
          }
        }
      } catch {
        // Continue on error
      }
    }
  }

  return results;
}

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
}

/**
 * Download all files from a skill directory
 */
async function downloadSkillFiles(
  token: string,
  repo: string,
  skillPath: string,
  branch: string,
  targetDir: string,
  onProgress?: (downloaded: number, total: number) => void
): Promise<void> {
  // Get the tree for the skill directory
  const treeUrl = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
  const treeResponse = await fetch(treeUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!treeResponse.ok) {
    throw new Error(`Failed to fetch repository tree: ${treeResponse.status}`);
  }

  const treeData = (await treeResponse.json()) as { tree: GitHubTreeItem[] };

  // Filter to only files in the skill directory
  const skillFiles = treeData.tree.filter(
    (item) => item.type === "blob" && item.path.startsWith(skillPath + "/")
  );

  if (skillFiles.length === 0) {
    throw new Error(`No files found in skill directory: ${skillPath}`);
  }

  // Create target directory
  await mkdir(targetDir, { recursive: true });

  // Download each file
  let downloaded = 0;
  for (const file of skillFiles) {
    const relativePath = file.path.substring(skillPath.length + 1);
    const targetPath = join(targetDir, relativePath);
    const targetFileDir = join(targetDir, relativePath.split("/").slice(0, -1).join("/"));

    // Create parent directories if needed
    if (targetFileDir !== targetDir) {
      await mkdir(targetFileDir, { recursive: true });
    }

    // Download file content
    const fileUrl = `https://api.github.com/repos/${repo}/contents/${file.path}?ref=${branch}`;
    const fileResponse = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${file.path}`);
    }

    const content = await fileResponse.text();
    await writeFile(targetPath, content, "utf-8");

    downloaded++;
    if (onProgress) {
      onProgress(downloaded, skillFiles.length);
    }
  }
}

export default function Install({ args: [skillName], options: opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<InstallState>({ phase: "checking" });

  useEffect(() => {
    async function install() {
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

      // Search for the skill
      const allRepos = config.repos;
      for (const repo of allRepos) {
        setState({ phase: "searching", repo: repo.repo });
      }

      const results = await findSkill(credentials.token, allRepos, skillName);

      if (results.length === 0) {
        setState({ phase: "not_found", skillName });
        exit();
        return;
      }

      if (results.length > 1) {
        setState({
          phase: "conflict",
          skillName,
          sources: results.map((r) => ({ repo: r.skill.repo, path: r.skill.path })),
        });
        exit();
        return;
      }

      // Single match - proceed with installation
      const { skill, commitSha } = results[0];
      const scope = opts.global ? "global" : "local";

      // Determine install path
      const baseDir = opts.global
        ? join(homedir(), ".claude", "skills")
        : join(process.cwd(), ".claude", "skills");
      const installPath = join(baseDir, skill.name);

      // Initialize steps
      const steps: InstallStep[] = [
        { label: "Fetching skill metadata", status: "done" },
        { label: "Downloading files", status: "in_progress" },
        { label: `Installing to ${scope === "global" ? "~" : "."}/.claude/skills/${skill.name}`, status: "pending" },
        { label: "Verifying installation", status: "pending" },
      ];

      setState({
        phase: "installing",
        skill,
        scope,
        steps,
        progress: 25,
      });

      try {
        // Get branch from repo config
        const repoConfig = config.repos.find((r) => r.repo === skill.repo);
        const branch = repoConfig?.branch || "main";

        // Download files
        await downloadSkillFiles(
          credentials.token,
          skill.repo,
          skill.path,
          branch,
          installPath,
          (downloaded, total) => {
            const downloadProgress = 25 + (downloaded / total) * 50;
            setState((prev) => {
              if (prev.phase !== "installing") return prev;
              return { ...prev, progress: Math.round(downloadProgress) };
            });
          }
        );

        // Update steps - downloading done
        steps[1].status = "done";
        steps[2].status = "in_progress";
        setState((prev) => {
          if (prev.phase !== "installing") return prev;
          return { ...prev, steps: [...steps], progress: 85 };
        });

        // Record in config
        const installedSkill: InstalledSkill = {
          name: skill.name,
          repo: skill.repo,
          repoPath: skill.path,
          commitSha,
          version: skill.version || "1.0.0",
          type: skill.type || "skill",
          installedPath: installPath,
          scope,
        };
        addInstalledSkill(installedSkill);

        // Update steps - installation done
        steps[2].status = "done";
        steps[3].status = "in_progress";
        setState((prev) => {
          if (prev.phase !== "installing") return prev;
          return { ...prev, steps: [...steps], progress: 95 };
        });

        // Verification step (quick file check)
        steps[3].status = "done";
        setState((prev) => {
          if (prev.phase !== "installing") return prev;
          return { ...prev, steps: [...steps], progress: 100 };
        });

        // Short delay to show completion
        await new Promise((resolve) => setTimeout(resolve, 200));

        setState({
          phase: "success",
          skill,
          installedPath: installPath,
        });
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Installation failed",
        });
      }

      exit();
    }

    install().catch((err) => {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Installation failed",
      });
      exit();
    });
  }, [skillName, opts.global, exit]);

  switch (state.phase) {
    case "checking":
      return <Spinner text="Initializing..." />;

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
          <Text dimColor>Run 'skilluse repo add owner/repo' to add a skill repository.</Text>
        </Box>
      );

    case "searching":
      return <Spinner text={`Searching ${state.repo}...`} />;

    case "not_found":
      return (
        <Box flexDirection="column">
          <StatusMessage type="error">Skill "{state.skillName}" not found</StatusMessage>
          <Box marginTop={1}>
            <Text dimColor>Try 'skilluse search {state.skillName}' to find available skills.</Text>
          </Box>
        </Box>
      );

    case "conflict":
      return (
        <Box flexDirection="column">
          <StatusMessage type="warning">
            Skill "{state.skillName}" found in multiple repos:
          </StatusMessage>
          <Box flexDirection="column" marginTop={1} marginLeft={2}>
            {state.sources.map((source, i) => (
              <Text key={i}>
                {source.repo}/{source.path}
              </Text>
            ))}
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Use: skilluse install repo/skill-name to specify</Text>
          </Box>
        </Box>
      );

    case "installing":
      return (
        <Box flexDirection="column" borderStyle="round" paddingX={1}>
          <Box marginBottom={1}>
            <Text bold>Installing: </Text>
            <Text color="cyan">{state.skill.name}</Text>
            <Text dimColor> ({state.scope})</Text>
          </Box>

          {state.steps.map((step, i) => (
            <Box key={i}>
              <Text>
                {step.status === "done" && <Text color="green">✔</Text>}
                {step.status === "in_progress" && <Text color="yellow">◐</Text>}
                {step.status === "pending" && <Text dimColor>○</Text>}
                {step.status === "error" && <Text color="red">✖</Text>}
              </Text>
              <Text> {step.label}</Text>
            </Box>
          ))}

          <Box marginTop={1}>
            <ProgressBar percent={state.progress} width={30} />
          </Box>
        </Box>
      );

    case "success":
      return (
        <Box flexDirection="column">
          <StatusMessage type="success">
            Installed "{state.skill.name}" v{state.skill.version}
          </StatusMessage>
          <Box marginTop={1} marginLeft={2}>
            <Text dimColor>Location: {state.installedPath}</Text>
          </Box>
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
