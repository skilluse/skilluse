# Repo Discovery & Path Selection

## Overview
Implement SKILL.md auto-discovery scanning and interactive path selection UI for repo configuration.

## Requirements
- Scan GitHub repo for SKILL.md files
- Extract parent paths as skill source candidates
- Build interactive multi-select UI for path selection
- Support --path flag for non-interactive mode

## Technical Details

### Discovery Algorithm
1. Use GitHub API to traverse repo tree
2. Find all files named "SKILL.md"
3. Extract unique parent directory paths
4. Count skills per path

### GitHub API Usage
```typescript
// List repo tree recursively
GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1

// Filter for SKILL.md files
const skillFiles = tree.filter(f => f.path.endsWith('/SKILL.md'));
```

### Path Selection UI
```
┌─ Found 3 paths with SKILL.md ────────────────────┐
│                                                  │
│  Select paths to include:                        │
│                                                  │
│  [●] skills/code-review/      (2 skills)         │
│  [●] skills/doc-writer/       (1 skill)          │
│  [ ] skills/experimental/     (3 skills)         │
│                                                  │
│  ↑↓ navigate  ␣ toggle  a select all  ⏎ confirm │
└──────────────────────────────────────────────────┘
```

### Dependencies
- @octokit/rest (GitHub API)

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task01-project-setup
- [x] task02-ui-components
- [x] task03-oauth-flow

## Out of Scope
- Repo commands (task07)
- Caching of discovery results
