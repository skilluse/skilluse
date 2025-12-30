---
name: epic
description: Create and manage Epics - collections of related issues for major feature areas. Use when starting a new project(big feature), organizing work into themes, or adding reference documents.
---

# Epic - Epic Manager

Create and manage Epics for organizing related issues.

## Directory Structure

```
project/
├── epics/
│   ├── cli/
│   │   ├── epic.md                   # Epic overview and issue references
│   │   ├── progress.md               # Sprint progress tracking
│   │   └── references/               # Reference documents
│   │       └── Design.md
│   └── website/
│       ├── epic.md
│       ├── progress.md
│       └── references/
└── issues/
    └── ...
```

## What is an Epic?

An Epic is a collection of related issues grouped by major feature area or project.

Components:
- `epic.md` - Overview, goals, and issue references
- `progress.md` - Sprint progress tracking log
- `references/` - Design docs, specs, requirements

## When to Use

- User says "create epic", "new epic", "start project"
- Starting a new major feature area
- Organizing related issues under a theme
- Adding reference documents to an epic

---

## Creating an Epic

### Step 1: Create Epic Structure

```bash
mkdir -p epics/epic-name/references
```

### Step 2: Create epic.md

```markdown
# [Epic Title]

Brief description of what this epic encompasses.

## Overview

High-level goals and scope of this epic.

## Key Features

1. Feature area 1
2. Feature area 2
3. Feature area 3

## Related Issues

| Issue | Title | Status |
|-------|-------|--------|
| task01-xxx | Description | pending |
| task02-xxx | Description | pending |

## Progress

See [progress.md](progress.md) for sprint tracking.

## References

- [Design.md](references/Design.md) - Main design specification
```

### Step 3: Create progress.md

```markdown
# [Epic Name] Progress

## Current Status
Brief status description.

## In Progress
- [ ] issue-id - Description

## Completed Sprints

### [Sprint Name]
- [x] issue-id - Description

#### [YYYY-MM-DD] Session #N
- Working on: issue-id
- Completed: F001, F002
- Notes:
  - What was done
  - Decisions made
```

### Step 4: Add Reference Documents

Copy or create reference documents in `epics/epic-name/references/`:
- Design specifications
- Architecture diagrams
- API documentation
- Requirements documents

### Step 5: Git Commit

```bash
git add epics/epic-name/
git commit -m "feat: create epic-name epic"
```

---

## Updating an Epic

### Adding Issues to Epic

Update the "Related Issues" table in `epic.md`:

```markdown
| Issue | Title | Status |
|-------|-------|--------|
| task01-xxx | Description | completed |
| task02-xxx | Description | in-progress |
| task03-xxx | New issue | pending |
```

### Updating Progress

Add session entries to `progress.md`:

```markdown
#### [YYYY-MM-DD] Session #N
- Working on: issue-id
- Completed: F001, F002, F003
- Commits: abc123
- Notes:
  - Brief description of work done
```

### Adding References

Copy new reference documents to `references/` and update `epic.md`:

```markdown
## References

- [Design.md](references/Design.md) - Main design specification
- [API.md](references/API.md) - API documentation
```

---

## Rules

- Each Epic MUST have `epic.md` and `progress.md`
- Update issue status in `epic.md` when issues complete
- Log all sessions in `progress.md`
- Keep references organized and up-to-date
