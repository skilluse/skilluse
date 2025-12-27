# Parallel Agent Execution Guide

Run multiple AI agents on separate tickets using Git worktrees.

## Quick Start

```bash
# 1. Create worktree
git worktree add ../my-project-task02 -b task02-auth

# 2. Start agent in worktree
cd ../my-project-task02
claude --print "Follow task-work workflow. Complete task02-auth per design.md"

# 3. Continue your work in main repo
cd ../my-project

# 4. Merge when complete
git merge task02-auth
git worktree remove ../my-project-task02
```

## Coordination Rules

1. **One agent per worktree** - Never share
2. **Independent tickets only** - No dependencies
3. **Review before merge** - Verify agent work
4. **Clean up** - Remove worktrees after merge

## When to Use

**Good:**
- Well-defined tickets with features.json
- Independent, isolated work
- Bug fixes, docs, tests

**Avoid:**
- Core architectural changes
- Cross-file dependencies
- Frequent human decisions needed

## Agent Handoff Checklist

```
□ Ticket has design.md
□ features.json complete
□ No dependencies on other branches
□ Baseline tests pass
□ Clear agent instructions
```

## Monitoring

```bash
# From main repo
git -C ../my-project-task02 log --oneline -5
```

## Verification Before Merge

```bash
cd ../my-project-task02
npm test
cat features.json | jq '.[] | select(.passes == false)'
git log --oneline main..HEAD
```
