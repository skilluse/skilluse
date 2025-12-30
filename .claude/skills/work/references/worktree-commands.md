# Git Worktree Commands Reference

Git worktrees allow multiple working directories from a single repository.

## Core Commands

### Create Worktree

**New branch:**
```bash
git worktree add ../my-project-task02 -b task02-auth
```

**Existing branch:**
```bash
git worktree add ../my-project-task02 task02-auth
```

### List Worktrees
```bash
git worktree list
```

### Remove Worktree
```bash
git worktree remove ../my-project-task02
```

## @johnlindquist/worktree CLI

Streamlined CLI for worktree management.

### Install
```bash
npm install -g @johnlindquist/worktree@latest
```

### Commands

| Command | Description |
|---------|-------------|
| `wt new <name>` | Create worktree + open in editor |
| `wt open <name>` | Open existing worktree |
| `wt pr <number>` | Checkout PR into worktree |
| `wt list` | List all worktrees |
| `wt remove <name>` | Remove worktree |

### Examples

```bash
wt new task02-auth     # Create and open
wt pr 456              # Checkout PR #456
wt remove task02-auth  # Clean up
```

## Directory Structure

```
working-dir/
├─ my-project/              # Main repo
├─ my-project-task02/       # Worktree: agent task
├─ my-project-pr-456/       # Worktree: PR review
```

## PR Review Workflow

```bash
# 1. Checkout PR
wt pr 456

# 2. Fix issues
cd ../my-project-pr-456
# Make fixes...

# 3. Push and clean up
git add . && git commit -m "fix: resolve issue"
git push
wt remove pr-456
```
