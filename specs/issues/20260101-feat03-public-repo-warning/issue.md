# Security Warning for Public Repository Skills

## Overview

Add a security warning prompt when installing skills from public repositories. This helps users understand the security implications of running third-party code.

## Requirements

- Detect if a repository is public before installation
- Show a security warning for public repo skills
- Allow users to confirm or cancel installation
- Provide `--force` flag to skip the warning

## Technical Details

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /repos/{owner}/{repo} | Check repository visibility |

### Implementation

1. Add `isPublicRepo()` function in github.ts
2. Add `SecurityWarningPrompt` component in install.tsx
3. Add `--force` option to skip warning
4. Add `warning` phase to install state machine

### User Flow

1. User runs `skilluse install skill-name`
2. CLI resolves skill from configured repos
3. If repo is public, show security warning:
   - Skill name and source repo
   - Link to review code on GitHub
   - Suggestion to use private repo
   - Y/N prompt to continue
4. User presses Y to continue or N to cancel

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- Automatic security scanning of skill content
- Signature verification
