# Add Publish Command

## Overview

Add `skilluse publish <skill-name>` command to upload local skills to a configured GitHub repository.

## Command

```bash
skilluse publish <skill-name>
```

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| `skill-name` | Yes | Name of the skill to publish |

**No options.** Uses existing configuration:
- Target repo: from `skilluse repo use`
- Local path: from current agent (e.g., `.claude/skills/`)

## Workflow

```
skilluse publish commit

1. Get current agent config → .claude/skills/
2. Read skill → .claude/skills/commit/
3. Validate SKILL.md exists and has valid frontmatter
4. Get default repo config → owner/my-skills (path: skills/)
5. Upload files → owner/my-skills/skills/commit/
6. Show success with GitHub link
```

## Technical Details

### Validation

- SKILL.md must exist
- SKILL.md must have valid frontmatter: `name`, `description`

### GitHub API

Upload files using Contents API:
- `PUT /repos/{owner}/{repo}/contents/{path}` for each file

### Error Cases

| Error | Message |
|-------|---------|
| No default repo | "No default repo. Run: skilluse repo use <owner/repo>" |
| Skill not found | "Skill 'xxx' not found in .claude/skills/" |
| Missing SKILL.md | "SKILL.md not found in skill directory" |
| Invalid frontmatter | "SKILL.md missing required field: name" |
| No write access | "No write access to repo" |
| Skill exists in repo | Prompt: overwrite or cancel |

### New Files

```
packages/cli/src/
├── commands/
│   └── publish.tsx       # publish command
└── services/
    └── publish.ts        # GitHub upload logic
```

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- `repo init` command (users create repos manually on GitHub)
- `--to` option for target repo override
- `--path` option for custom path
- `--pr` option for pull request
- Version management
