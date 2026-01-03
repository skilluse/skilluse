# Skill Search

## Overview
Implement skill search functionality across configured repositories.

## Requirements
- `skilluse search <keyword>` - Search in default repo
- Display search results with name, description, repo, type

## Technical Details

### Search Algorithm
1. Load skill index from config (or fetch if stale)
2. Filter skills by keyword (name, description, tags)
3. Sort by relevance
4. Display results

### Search Fields
- Skill name (highest weight)
- Description
- Tags/keywords from SKILL.md frontmatter

### SKILL.md Parsing
```yaml
---
name: code-review
description: Automated code review skill
tags: [review, quality, automation]
type: claude-code
version: 1.0.0
---
```

### Search Results UI
```
┌─────────────────────────────────────────────────────┐
│  Search results for "review"                        │
├─────────────────────────────────────────────────────┤
│  code-review         Automated code review          │
│  └─ anthropics/skills  claude-code  v1.0.0          │
│                                                     │
│  pr-reviewer         Pull request reviewer          │
│  └─ company/tools      codex        v2.1.0          │
│                                                     │
│  3 skills found                                     │
└─────────────────────────────────────────────────────┘
```

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task05-config-store
- [x] task07-repo-commands

## Out of Scope
- Full-text search
- Fuzzy matching
- Skill installation
