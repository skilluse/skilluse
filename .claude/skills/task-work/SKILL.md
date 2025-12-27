---
name: task-work
description: Work incrementally on scrum tickets with Git worktree support for parallel agent workflows.
---

# Task Work - Incremental Implementation

Make incremental progress on scrum tickets, leaving clean state for next session.

Based on [Anthropic's Coding Agent pattern](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).

## When to Use

- Starting a new coding session
- User says "continue", "work on task", "next feature"
- Running AI agents on parallel tickets (via worktrees)

## Session Workflow

```
1. GET BEARINGS        →  pwd, git worktree list, cat scrum-progress.txt
       ↓
2. VERIFY BASELINE     →  Run dev server/tests, fix any broken state
       ↓
3. SELECT TICKET       →  Read scrum-progress.txt, pick highest priority
       ↓
4. IMPLEMENT           →  One feature at a time: implement → test → commit
       ↓
5. END SESSION         →  Commit all, update scrum-progress.txt
```

## Core Loop: Implement One Feature

```bash
# 1. Implement the feature
# 2. Test end-to-end (browser/HTTP/CLI)
# 3. Update features.json: "passes": true
# 4. Commit: git commit -m "feat(auth): implement registration (F001)"
```

## Rules

**DO:**
- Start every session with "Get Bearings"
- Work on ONE feature at a time
- Test BEFORE marking `passes: true`
- Commit after each completed feature

**DO NOT:**
- Skip baseline verification
- Mark features passing without testing
- Leave half-implemented code

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
```
