---
name: task-plan
description: Split design documents into scrum tickets with features.json. Use when starting a new project, planning features, or breaking down requirements.
---

# Task Plan - Project Initialization

Split a design document into independently verifiable scrum tickets for long-running agent workflows.

Based on [Anthropic's Initializer Agent pattern](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).

## When to Use

- User provides a design document or spec
- User says "plan project", "break down", "create tickets"
- Starting a new project or major feature

## Output Structure

```
project/
├── design.md                          # Original design document
├── scrum-progress.txt                 # Progress tracking log
└── tickets/
    ├── 20250115-task01-auth-setup/
    │   ├── design.md                  # Task-specific requirements
    │   └── features.json              # Verifiable feature checklist
    ├── 20250116-task02-user-login/
    │   ├── design.md
    │   └── features.json
    └── ...
```

## Instructions

### Step 1: Analyze Design Document

Read the design document and identify:
- All major features and components
- Dependencies between features
- Logical groupings for incremental delivery

### Step 2: Create Ticket Structure

```bash
mkdir -p tickets
```

Split into tickets following these rules:
- Each ticket completable in 1-2 agent sessions
- Each ticket independently verifiable
- Order by dependencies (foundational first)
- Naming: `YYYYMMDD-taskNN-short-description/`

### Step 3: Create Files for Each Ticket

For each ticket, create:

**design.md** - Specific requirements:
```markdown
# [Ticket Title]

## Overview
Brief description of what this ticket accomplishes.

## Requirements
- Requirement 1
- Requirement 2

## Technical Details
Implementation specifics, API endpoints, data models.

## Acceptance Criteria
See features.json for testable criteria.

## Dependencies
- Tickets that must be completed first

## Out of Scope
- What this ticket does NOT include
```

**features.json** - Testable acceptance criteria:
```json
{
  "ticket": "task01-auth-setup",
  "title": "Authentication System Setup",
  "priority": 1,
  "status": "pending",
  "dependencies": [],
  "parallelizable": true,
  "features": [
    {
      "id": "F001",
      "category": "functional",
      "description": "User can register with email and password",
      "steps": [
        "Navigate to /register",
        "Fill in email and password fields",
        "Submit the form",
        "Verify success message appears"
      ],
      "passes": false
    }
  ],
  "completed_at": null
}
```

### Step 4: Create Progress File

Create `scrum-progress.txt` in project root:

```
# Scrum Progress Log

## Project: [Project Name]
Created: YYYY-MM-DD

## Current Sprint
- [ ] task01-xxx
- [ ] task02-xxx
- [ ] task03-xxx

## Completed
(none yet)

## Session Log
[YYYY-MM-DD HH:MM] Project initialized with N tickets
```

### Step 5: Git Commit

Commit the initial structure:
```bash
git add .
git commit -m "feat: initialize project with N tickets"
```

## Ticket Sizing Guidelines

| Size | Features | Sessions | Example |
|------|----------|----------|---------|
| Small | 2-4 | 1 | Add logout button |
| Medium | 5-8 | 1-2 | User authentication |
| Large | 8+ | Split it! | - |

If a ticket has more than 8 features, split it into smaller tickets.

## Example: Chat App Breakdown

Input: "Build a chat app with auth, real-time messaging, file sharing"

Output:
```
tickets/
├── 20250115-task01-project-setup/     (dev server, routing, database)
├── 20250116-task02-user-auth/         (register, login, logout)
├── 20250117-task03-chat-ui/           (layout, input, message list)
├── 20250118-task04-realtime/          (websocket, send, receive)
├── 20250119-task05-file-upload/       (UI, storage, download)
└── 20250120-task06-polish/            (errors, loading, mobile)
```

## Rules

- Each ticket MUST have both `design.md` and `features.json`
- All features start with `"passes": false`
- Priority 1 = highest priority
- Dependencies must reference other ticket names

## Parallel Execution

The `parallelizable` field indicates if a ticket can be worked on by a background AI agent in a separate Git worktree.

### When to Set `parallelizable: true`

- Ticket has no pending dependencies (or dependencies are complete)
- Work is isolated and won't conflict with other branches
- Clear requirements in design.md and features.json
- No frequent human decisions needed

### When to Set `parallelizable: false`

- Has dependencies on incomplete tickets
- Core architectural changes affecting many files
- Requires interactive human feedback
- Will likely conflict with other parallel work

### Example: Identifying Parallel Tasks

```
tickets/
├── task01-project-setup/    parallelizable: false  (foundational, do first)
├── task02-user-auth/        parallelizable: true   (after task01)
├── task03-chat-ui/          parallelizable: true   (after task01, parallel with task02)
├── task04-realtime/         parallelizable: false  (depends on task02 + task03)
└── task05-file-upload/      parallelizable: true   (after task01, independent)
```

In this example, after task01 completes:
- task02, task03, task05 can run in parallel (3 agents in 3 worktrees)
- task04 waits for task02 + task03

## References

Template files:
- `references/features.template.json`
- `references/design.template.md`
