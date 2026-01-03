# CLI Epic

SkillUse CLI - A command-line tool for managing and installing AI Coding Agent Skills.

## Overview

The CLI provides a unified interface for discovering, installing, and managing skills across multiple AI coding agents (Claude Code, Codex, Cursor, VSCode, etc.).

## Key Features

1. **GitHub OAuth Authentication** - Device Flow authentication for secure access
2. **Skill Repo Management** - Add/remove GitHub repos as skill sources
3. **Skill Installation** - Download and install skills to appropriate directories
4. **Version Tracking** - Git SHA-based versioning with upgrade detection

## Related Issues

### Core Development (task series)

| Issue | Title | Status |
|-------|-------|--------|
| task01-project-setup | Project Setup | completed |
| task02-ui-components | UI Components | completed |
| task03-oauth-flow | OAuth Flow | completed |
| task04-auth-commands | Auth Commands | completed |
| task05-config-store | Config Store | completed |
| task06-repo-discovery | Repo Discovery | completed |
| task07-repo-commands | Repo Commands | completed |
| task08-skill-search | Skill Search | completed |
| task09-skill-install | Skill Install | completed |
| task10-polish | Polish | completed |
| task12-cli-polish | CLI Polish | completed |
| task14-multi-agent-support | Multi-Agent Support | completed |

### Configuration (cfg series)

| Issue | Title | Status |
|-------|-------|--------|
| cfg01-platform-paths | Platform Paths | completed |
| cfg02-secure-credentials | Secure Credentials | completed |
| cfg03-config-migration | Config Migration | completed |

### Build & Release

| Issue | Title | Status |
|-------|-------|--------|
| build01-bun-release | Bun Release | completed |
| npm-first-release | NPM First Release | completed |
| ci-lockfile-fix | CI Lockfile Fix | completed |
| remove-keytar | Remove Keytar | completed |

### Migrations

| Issue | Title | Status |
|-------|-------|--------|
| github-app-migration | GitHub App Migration | completed |

### Authentication

| Issue | Title | Status |
|-------|-------|--------|
| auth01-optional-authentication | Optional Auth for Public Repos | pending |

### Refactoring

| Issue | Title | Status |
|-------|-------|--------|
| refactor01-agent-command | Simplify "agent use" to "agent" | completed |
| refactor02-login-force-flag | Remove --force flag from login | completed |
| refactor03-remove-version-field | Remove version field from InstalledSkill | pending |

### Bug Fixes

| Issue | Title | Status |
|-------|-------|--------|
| bug01-ink-static-component | Fix Ink Exit Race Condition | pending |
| bug02-list-filesystem-sync | Verify Filesystem and CWD in List | pending |

### New Features

| Issue | Title | Status |
|-------|-------|--------|
| feat01-repo-write-commands | Add Repo Init and Publish Commands | pending |
| feat02-status-command | Add Status Command as Default Action | pending |
| feat03-public-repo-warning | Security Warning for Public Repos | completed |
| feat04-repo-url-support | Support Full GitHub URLs in Repo Add | completed |

## References

- [Design.md](references/Design.md) - Complete CLI design specification
