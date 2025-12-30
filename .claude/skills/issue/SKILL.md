---
name: issue
description: Create and manage Issues - individual work items with testable acceptance criteria. Use when planning features, creating tasks, or updating issue status.
---

# Issue - Issue Manager

Create and manage Issues with testable acceptance criteria.

## Directory Structure

```
project/
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

## Creating an Issue

### Step 1: Create Issue Directory

```bash
mkdir -p issues/YYYYMMDD-issueID-short-description
```

### Step 2: Create issue.md

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

### Step 3: Create feature.json

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

### Step 4: Update Epic

Add the new issue to the related Epic's `epic.md` table:

```markdown
| Issue | Title | Status |
|-------|-------|--------|
| task01-auth-setup | Authentication Setup | pending |
```

### Step 5: Git Commit

```bash
git add issues/YYYYMMDD-issueID-*/
git commit -m "feat: create issue task01-auth-setup"
```

---

## Updating an Issue

### Update issue.md

Add an "Updates" section to document changes:

```markdown
## Updates (YYYY-MM-DD)

### Issue: [Brief description]
- **Problem**: What was wrong
- **Solution**: How it was fixed
- **Files**: Which files were modified
```

### Update feature.json

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

### Update Epic Progress

Add entry to the Epic's `progress.md`:
```
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
