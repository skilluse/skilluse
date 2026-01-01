---
name: issue
description: Create and manage local Issue specs (specs/issues/) - individual work items with testable acceptance criteria. Use for "create issue", "new task", "list issues", "check issues", "pick issue". NOTE - For GitHub issues, use `gh issue` command directly.
---

# Issue - Issue Manager

Create and manage Issues with testable acceptance criteria.

## Directory Structure

```
project/
└── specs/
    ├── epics/
    │   └── epic-name/
    │       ├── epic.md
    │       └── progress.md
    └── issues/
        ├── 20250115-task01-auth-setup/
        │   ├── issue.md                  # Issue requirements
        │   └── feature.json              # Testable acceptance criteria
        └── 20250116-web01-landing-page/
            ├── issue.md
            └── feature.json
```

## What is an Issue?

An Issue is a single work item with testable acceptance criteria.

Components:
- `issue.md` - Requirements and technical details
- `feature.json` - Tracking work progress with pass/fail status

Naming convention: `YYYYMMDD-issueID-short-description/`
- Date prefix: `YYYYMMDD`
- Issue ID: `taskNN`, `webNN`, `cfgNN`, `bugNN`, etc.
- Short description: `auth-setup`, `landing-page`, etc.

## When to Use

- User says "create issue", "new task", "plan feature"
- Breaking down an Epic into work items
- Adding a bug fix or enhancement task
- Updating issue requirements or status

---

## IMPORTANT: Epic Context

**Before creating or updating any Issue, you MUST:**

1. **Read Epic Context First**
   ```bash
   # Read the related Epic's files
   cat specs/epics/EPIC_NAME/epic.md        # Understand goals and existing issues
   cat specs/epics/EPIC_NAME/progress.md    # Check current sprint status
   ls specs/epics/EPIC_NAME/references/     # Review design docs and specs
   ```

2. **After Creating/Updating Issue**
   - Update `epic.md` - Add new issue to "Related Issues" table
   - Update `progress.md` - Log the action taken
   - Ensure issue aligns with Epic goals and references

This ensures Issues are consistent with Epic's design and requirements.

---

## Creating an Issue

### Step 1: Read Epic Context

```bash
# Identify the related Epic and read its context
cat specs/epics/EPIC_NAME/epic.md           # Goals, existing issues
cat specs/epics/EPIC_NAME/progress.md       # Current sprint status
cat specs/epics/EPIC_NAME/references/*.md   # Design specs, requirements
```

### Step 2: Create Issue Directory

```bash
mkdir -p specs/issues/YYYYMMDD-issueID-short-description
```

### Step 3: Create issue.md

```markdown
# [Issue Title]

## Overview
Brief description of what this issue accomplishes.

## Requirements
- Requirement 1
- Requirement 2
- Requirement 3

## Technical Details

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/xxx | Description |

### Data Models
```
Model {
  field1: type
  field2: type
}
```

### Dependencies
- Library/package dependencies
- External service dependencies

## Acceptance Criteria
See `feature.json` for testable criteria.

## Issue Dependencies
- [ ] issueNN-xxx (must be completed first)

## Out of Scope
- What this issue does NOT include
```

### Step 4: Create feature.json

```json
{
  "issue": "task01-auth-setup",
  "title": "Authentication System Setup",
  "epic": "cli",
  "priority": 1,
  "status": "pending",
  "created_at": "2025-01-15",
  "completed_at": null,
  "dependencies": [],
  "parallelizable": true,
  "features": [
    {
      "id": "F001",
      "category": "functional",
      "description": "User can register with email and password",
      "steps": [
        "Step 1: Navigate to /register",
        "Step 2: Fill in email and password",
        "Step 3: Submit the form",
        "Step 4: Verify success message"
      ],
      "passes": false,
      "notes": ""
    }
  ],
  "metadata": {
    "estimated_sessions": 1,
    "actual_sessions": 0,
    "blockers": []
  }
}
```

### Step 5: Update Epic Context

**This step is mandatory.** Update the Epic to reflect the new issue:

1. Update `epic.md` - Add to "Related Issues" table:
   ```markdown
   | Issue | Title | Status |
   |-------|-------|--------|
   | task01-auth-setup | Authentication Setup | pending |
   ```

2. Update `progress.md` - Log the creation:
   ```markdown
   [YYYY-MM-DD HH:MM] Created issue task01-auth-setup: Authentication Setup
   ```

### Step 6: Git Commit

```bash
git add specs/issues/YYYYMMDD-issueID-*/ specs/epics/EPIC_NAME/
git commit -m "feat: create issue task01-auth-setup"
```

---

## Updating an Issue

### Step 1: Read Epic Context First

```bash
# Always read Epic context before making changes
cat specs/epics/EPIC_NAME/epic.md
cat specs/epics/EPIC_NAME/progress.md
```

### Step 2: Update issue.md

Add an "Updates" section to document changes:

```markdown
## Updates (YYYY-MM-DD)

### Issue: [Brief description]
- **Problem**: What was wrong
- **Solution**: How it was fixed
- **Files**: Which files were modified
```

### Step 3: Update feature.json

Mark completed features:
```json
{
  "id": "F001",
  "description": "Feature description",
  "passes": true,
  "notes": "Fixed YYYY-MM-DD: Brief explanation"
}
```

Update issue status:
```json
{
  "status": "in-progress",
  "completed_at": "2025-01-15"
}
```

### Step 4: Update Epic Context

**This step is mandatory.** Update both Epic files:

1. Update `epic.md` - Change issue status if needed:
   ```markdown
   | task01-auth-setup | Authentication Setup | completed |
   ```

2. Update `progress.md` - Log the changes:
   ```markdown
   [YYYY-MM-DD HH:MM] Updated issue-name: brief description
   ```

---

## Issue Sizing Guidelines

| Size | Features | Sessions | Example |
|------|----------|----------|---------|
| Small | 2-4 | 1 | Add logout button |
| Medium | 5-8 | 1-2 | User authentication |
| Large | 8+ | Split it! | - |

If an issue has more than 8 features, split it into smaller issues.

---

## Parallel Execution

The `parallelizable` field indicates if an issue can be worked on by a background AI agent.

### Set `parallelizable: true` when:
- No pending dependencies
- Work is isolated
- Clear requirements
- No frequent human decisions needed

### Set `parallelizable: false` when:
- Has dependencies on incomplete issues
- Core architectural changes
- Requires interactive feedback
- Will conflict with other work

---

## Rules

- Each Issue MUST have both `issue.md` and `feature.json`
- All features start with `"passes": false`
- Priority 1 = highest priority
- Dependencies reference other issue IDs
- Always update the Epic when issue status changes

## References

Template files:
- `references/feature.template.json`
- `references/issue.template.md`
