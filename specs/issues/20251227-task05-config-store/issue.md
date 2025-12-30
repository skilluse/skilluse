# Configuration Store

## Overview
Implement configuration file management for storing auth tokens, repos, and installed skills.

## Requirements
- Store configuration in `~/.skilluse/config.json`
- Manage auth token securely
- Track configured repos
- Track installed skills

## Technical Details

### Configuration Structure
```typescript
interface Config {
  auth: {
    token: string;
    user: string;
  } | null;
  defaultRepo: string | null;
  repos: RepoConfig[];
  installed: InstalledSkill[];
}

interface RepoConfig {
  repo: string;        // "owner/repo"
  branch: string;
  paths: string[];
}

interface InstalledSkill {
  name: string;
  repo: string;
  repoPath: string;
  commitSha: string;
  version: string;
  type: string;
  installedPath: string;
  scope: "local" | "global";
}
```

### File Location
- Config: `~/.skilluse/config.json`
- Ensure directory exists on first write

### Dependencies
- conf (configuration storage library)

### API
```typescript
// store.ts
export function getConfig(): Config;
export function setAuth(token: string, user: string): void;
export function clearAuth(): void;
export function addRepo(repo: RepoConfig): void;
export function removeRepo(repoName: string): void;
export function setDefaultRepo(repoName: string): void;
export function addInstalledSkill(skill: InstalledSkill): void;
export function removeInstalledSkill(name: string): void;
```

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task01-project-setup

## Out of Scope
- Encryption of tokens (rely on file permissions)
- Migration between config versions
