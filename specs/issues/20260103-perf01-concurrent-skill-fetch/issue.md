# Concurrent Skill Metadata Fetching

## Problem

`search` and `repo skills` fetch SKILL.md files sequentially, causing slow performance:

```typescript
// Current: Sequential (slow)
for (const dir of dirs) {
  const skillResponse = await fetch(skillMdUrl);  // Waits for each one
  // ...
}
```

With 10 skills and ~200ms per request:
- List directories: 200ms
- Fetch skill 1: 200ms
- Fetch skill 2: 200ms
- ...
- Fetch skill 10: 200ms
- **Total: 2.2 seconds**

## Solution

Fetch all SKILL.md files concurrently using `Promise.all`:

```typescript
// New: Concurrent (fast)
const skillPromises = dirs.map(async (dir) => {
  const skillResponse = await fetch(skillMdUrl);
  // ...
});
const results = await Promise.all(skillPromises);
```

With 10 skills:
- List directories: 200ms
- Fetch all skills (parallel): 200ms
- **Total: 400ms** (5x faster)

## Implementation

### Affected Files

Both commands have nearly identical `fetchSkillsFromRepo` functions:
- `packages/cli/src/commands/search.tsx` (lines 92-166)
- `packages/cli/src/commands/repo/skills.tsx` (lines 82-164)

### Code Change

```typescript
async function fetchSkillsFromRepo(
  token: string | undefined,
  repoConfig: RepoConfig,
): Promise<SkillMetadata[] | { authRequired: true; message: string }> {
  const { repo, branch, paths } = repoConfig;
  const searchPaths = paths.length > 0 ? paths : [""];

  for (const basePath of searchPaths) {
    // 1. Get directory listing (single request)
    const response = await fetch(apiPath, { headers });
    const contents = await response.json();
    const dirs = contents.filter((item) => item.type === "dir");

    // 2. Fetch all SKILL.md files concurrently
    const skillPromises = dirs.map(async (dir) => {
      try {
        const skillMdUrl = `https://api.github.com/repos/${repo}/contents/${dir.path}/SKILL.md?ref=${branch}`;
        const skillResponse = await fetch(skillMdUrl, {
          headers: buildGitHubRawHeaders(token),
        });

        if (!skillResponse.ok) return null;

        const content = await skillResponse.text();
        const frontmatter = parseFrontmatter(content);

        if (!frontmatter.name) return null;

        return {
          name: String(frontmatter.name),
          description: String(frontmatter.description || ""),
          type: frontmatter.type ? String(frontmatter.type) : undefined,
          tags: Array.isArray(frontmatter.tags)
            ? frontmatter.tags.map(String)
            : undefined,
          repo,
          path: dir.path,
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(skillPromises);
    const skills = results.filter((s): s is SkillMetadata => s !== null);
  }

  return skills;
}
```

### Code Deduplication

Since both `search.tsx` and `repo/skills.tsx` have identical logic, extract to shared service:

```
packages/cli/src/services/
└── skills.ts    # New: shared fetchSkillsFromRepo, parseFrontmatter
```

## Acceptance Criteria

- [ ] SKILL.md files fetched concurrently with `Promise.all`
- [ ] `search` command is faster (measure before/after)
- [ ] `repo skills` command is faster
- [ ] Shared code extracted to `services/skills.ts`
- [ ] `parseFrontmatter` extracted to shared service
- [ ] Error handling preserved (individual failures don't break entire search)

## Notes

- GitHub API rate limit: 5000/hour (authenticated), concurrent requests count individually
- For repos with 50+ skills, consider batching (e.g., 10 concurrent at a time) to avoid overwhelming the API
