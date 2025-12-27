---
name: task-work
description: Work incrementally on scrum tickets with Git worktree support for parallel agent workflows. (project)
---

# Task Work - Incremental Implementation

Make incremental progress on scrum tickets, leaving clean state for next session.

Based on [Anthropic's Coding Agent pattern](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).

## Arguments

This skill accepts an optional ticket path:
```
/task-work [ticket-path]
```

Examples:
- `/task-work` - Continue work on current ticket from scrum-progress.txt
- `/task-work tickets/20251227-task05-config-store` - Work on specific ticket

## When to Use

- Starting a new coding session
- User says "continue", "work on task", "next feature"
- Running AI agents on parallel tickets (via worktrees)

## Session Workflow

```
1. GET BEARINGS        →  pwd, git worktree list, cat scrum-progress.txt
       ↓
2. READ TICKET         →  Read design.md and features.json from ticket directory
       ↓
3. VERIFY BASELINE     →  Run build/tests, fix any broken state
       ↓
4. IMPLEMENT           →  One feature at a time: implement → test → commit
       ↓
5. END SESSION         →  Use /commit skill, update scrum-progress.txt
```

## Reading the Ticket

Each ticket directory contains:
- `design.md` - Requirements, technical details, API design
- `features.json` - Testable acceptance criteria with pass/fail status

```bash
# Read ticket to understand the work
cat tickets/TICKET_ID/design.md
cat tickets/TICKET_ID/features.json
```

## Core Loop: Implement One Feature

```bash
# 1. Implement the feature
# 2. Test end-to-end (browser/HTTP/CLI)
# 3. Update features.json: "passes": true
# 4. Use /commit skill to commit changes
```

## Rules

**DO:**
- Start every session with "Get Bearings"
- Read design.md and features.json before implementing
- Work on ONE feature at a time
- Test BEFORE marking `passes: true`
- Use `/commit` skill for commits (not manual git commit)
- Update scrum-progress.txt at session end

**DO NOT:**
- Skip baseline verification
- Mark features passing without testing
- Leave half-implemented code
- Commit without using the commit skill

## Parallel Development (Worktrees)

Use Git worktrees to run agents on separate tickets in parallel:

```bash
# Create worktree for agent
git worktree add ../project-task02 -b task02
cd ../project-task02
claude --print "Complete task02 per design.md"

# Continue your work in main repo
cd ../project
```

See: [worktree-commands.md](references/worktree-commands.md) | [parallel-agents.md](references/parallel-agents.md)

## Handling Issues

| Issue | Action |
|-------|--------|
| Broken baseline | Fix FIRST, then new work |
| Blocked by dependency | Document, switch ticket or end session |
| Feature fails testing | Keep `passes: false`, fix and re-test |

## Progress File Format

```
### [YYYY-MM-DD HH:MM] Session #N
- Working on: task02-auth
- Completed: F001, F002
- In progress: F003
- Commits: abc123, def456
- Notes:
  - Brief description of what was done
  - Any important decisions or changes
```
