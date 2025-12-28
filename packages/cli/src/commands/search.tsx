import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
  getCredentials,
  getConfig,
  type RepoConfig,
} from "../services/index.js";

export const args = z.tuple([z.string().describe("Search keyword")]);

export const options = z.object({
  all: z
    .boolean()
    .default(false)
    .describe("Search in all configured repos (not just default)"),
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
  tags?: string[];
  repo: string;
  path: string;
}

type SearchState =
  | { phase: "checking" }
  | { phase: "not_logged_in" }
  | { phase: "no_repos" }
  | { phase: "searching"; repo: string }
  | { phase: "success"; skills: SkillMetadata[]; keyword: string }
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

  // Simple YAML parser for frontmatter
  const lines = yaml.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: unknown = line.substring(colonIndex + 1).trim();

    // Handle arrays like [tag1, tag2]
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
 * Fetch SKILL.md files from a GitHub repo
 */
async function fetchSkillsFromRepo(
  token: string,
  repoConfig: RepoConfig
): Promise<SkillMetadata[]> {
  const { repo, branch, paths } = repoConfig;
  const skills: SkillMetadata[] = [];

  // Search paths - if none specified, search root
  const searchPaths = paths.length > 0 ? paths : [""];

  for (const basePath of searchPaths) {
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

      if (!response.ok) {
        continue;
      }

      const contents = (await response.json()) as Array<{
        name: string;
        path: string;
        type: string;
      }>;

      // Find directories that might contain SKILL.md
      const dirs = contents.filter((item) => item.type === "dir");

      for (const dir of dirs) {
        // Check if this directory has a SKILL.md
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

          if (frontmatter.name) {
            skills.push({
              name: String(frontmatter.name),
              description: String(frontmatter.description || ""),
              type: frontmatter.type ? String(frontmatter.type) : undefined,
              version: frontmatter.version ? String(frontmatter.version) : undefined,
              tags: Array.isArray(frontmatter.tags)
                ? frontmatter.tags.map(String)
                : undefined,
              repo,
              path: dir.path,
            });
          }
        }
      }
    } catch {
      // Continue on error
    }
  }

  return skills;
}

/**
 * Filter skills by search keyword
 */
function filterSkills(skills: SkillMetadata[], keyword: string): SkillMetadata[] {
  const lowerKeyword = keyword.toLowerCase();

  return skills.filter((skill) => {
    // Match name
    if (skill.name.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // Match description
    if (skill.description.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // Match tags
    if (skill.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword))) {
      return true;
    }

    return false;
  });
}

export default function Search({ args: [keyword], options: opts }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<SearchState>({ phase: "checking" });

  useEffect(() => {
    async function search() {
      // Check if logged in
      const credentials = await getCredentials();
      if (!credentials) {
        setState({ phase: "not_logged_in" });
        exit();
        return;
      }

      const config = getConfig();

      // Determine which repos to search
      let reposToSearch: RepoConfig[] = [];

      if (opts.all) {
        reposToSearch = config.repos;
      } else if (config.defaultRepo) {
        const defaultRepoConfig = config.repos.find(
          (r) => r.repo === config.defaultRepo
        );
        if (defaultRepoConfig) {
          reposToSearch = [defaultRepoConfig];
        }
      } else if (config.repos.length > 0) {
        // Use first repo if no default
        reposToSearch = [config.repos[0]];
      }

      if (reposToSearch.length === 0) {
        setState({ phase: "no_repos" });
        exit();
        return;
      }

      // Fetch skills from all repos
      const allSkills: SkillMetadata[] = [];

      for (const repoConfig of reposToSearch) {
        setState({ phase: "searching", repo: repoConfig.repo });

        const skills = await fetchSkillsFromRepo(credentials.token, repoConfig);
        allSkills.push(...skills);
      }

      // Filter by keyword
      const matchingSkills = filterSkills(allSkills, keyword);

      setState({ phase: "success", skills: matchingSkills, keyword });
      exit();
    }

    search().catch((err) => {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Search failed",
      });
      exit();
    });
  }, [keyword, opts.all, exit]);

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

    case "success":
      if (state.skills.length === 0) {
        return (
          <Box flexDirection="column">
            <Box marginBottom={1}>
              <Text>Search results for "</Text>
              <Text color="cyan">{state.keyword}</Text>
              <Text>"</Text>
            </Box>
            <StatusMessage type="warning">No skills found</StatusMessage>
            <Box marginTop={1}>
              <Text dimColor>
                Try a different search term or check your configured repos with 'skilluse
                repo list'.
              </Text>
            </Box>
          </Box>
        );
      }

      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text>Search results for "</Text>
            <Text color="cyan">{state.keyword}</Text>
            <Text>"</Text>
          </Box>

          {state.skills.map((skill) => (
            <Box key={`${skill.repo}/${skill.path}`} flexDirection="column" marginBottom={1}>
              <Box>
                <Text color="cyan" bold>
                  {skill.name}
                </Text>
                {skill.version && <Text dimColor> v{skill.version}</Text>}
              </Box>
              <Box marginLeft={2}>
                <Text>{skill.description}</Text>
              </Box>
              <Box marginLeft={2}>
                <Text dimColor>
                  {skill.repo}
                  {skill.type && ` • ${skill.type}`}
                </Text>
              </Box>
            </Box>
          ))}

          <Box marginTop={1}>
            <Text dimColor>
              {state.skills.length} skill{state.skills.length !== 1 ? "s" : ""} found
            </Text>
          </Box>
        </Box>
      );

    case "error":
      return <StatusMessage type="error">{state.message}</StatusMessage>;
  }
}
