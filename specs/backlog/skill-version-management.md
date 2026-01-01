# Skill Version Management

## Overview

Add version support to skills, enabling users to publish and install specific versions. This allows skill authors to maintain backward compatibility while evolving their skills.

## Design Decision: Git Tags + GitHub Releases

After evaluating multiple approaches, the recommended solution is:

1. **Git Tags** for version pointers: `{skill-name}/v{version}`
2. **GitHub Releases** for reliable distribution with tarball assets

### Why This Approach

| Approach | Pros | Cons |
|----------|------|------|
| Git Tags only | Simple, native Git | No separate release notes |
| GitHub Releases | Reliable CDN, release notes | Slightly more complex |
| Central Registry | Fast discovery | Single point of failure |
| **Tags + Releases** | Best of both, reliable | Two-step publish |

## Technical Design

### Tag Format

```
{skill-name}/v{version}
```

Examples:
- `commit/v1.0.0`
- `code-review/v2.1.0`
- `my-skill/v0.1.0`

### GitHub Release

Each version creates a GitHub Release with:
- Tag: `{skill-name}/v{version}`
- Title: `{skill-name} v{version}`
- Body: Changelog from SKILL.md or commit messages
- Asset: `{skill-name}-{version}.tar.gz`

### API Support

GitHub API supports tag-based file access:
```
GET /repos/{owner}/{repo}/contents/{path}?ref={tag}
```

Example:
```
GET /repos/anthropics/skills/contents/skills/commit/SKILL.md?ref=commit/v1.0.0
```

### CLI Commands

#### Publish with Version

```bash
skilluse publish ./my-skill --version 1.0.0
```

Workflow:
1. Validate SKILL.md exists and has required fields
2. Create/update files in repository
3. Create Git tag: `{skill-name}/v{version}`
4. Create GitHub Release with tarball asset

#### Install Specific Version

```bash
skilluse install repo/skill@1.0.0
skilluse install anthropics/skills/commit@1.0.0
```

#### List Available Versions

```bash
skilluse versions repo/skill
skilluse versions anthropics/skills/commit
```

Output:
```
commit versions:
  v1.2.0 (latest)
  v1.1.0
  v1.0.0
```

### SKILL.md Version Field

```yaml
---
name: my-skill
description: Brief description
version: 1.0.0           # Optional: current version
---
```

## API Calls

### Create Tag
```bash
POST /repos/{owner}/{repo}/git/refs
{
  "ref": "refs/tags/{skill-name}/v{version}",
  "sha": "{commit-sha}"
}
```

### Create Release
```bash
POST /repos/{owner}/{repo}/releases
{
  "tag_name": "{skill-name}/v{version}",
  "name": "{skill-name} v{version}",
  "body": "Release notes..."
}
```

### List Tags (for versions)
```bash
GET /repos/{owner}/{repo}/git/refs/tags/{skill-name}/
```

### Download by Tag
```bash
GET /repos/{owner}/{repo}/contents/{path}?ref={tag}
```

## Acceptance Criteria

### Publish with Version
- [ ] `publish --version` creates Git tag
- [ ] `publish --version` creates GitHub Release
- [ ] Release includes tarball asset
- [ ] Tag format follows `{skill-name}/v{version}`
- [ ] Version in SKILL.md updated if provided

### Install with Version
- [ ] `install skill@version` downloads specific version
- [ ] Version format supports semver (1.0.0)
- [ ] `@latest` is default behavior
- [ ] Error when version not found

### Version Listing
- [ ] `versions` command lists all versions
- [ ] Shows which version is installed locally
- [ ] Marks latest version

### Version Validation
- [ ] Validates semver format
- [ ] Prevents duplicate version tags
- [ ] Warns if version in SKILL.md doesn't match --version

## Dependencies

- Requires `repo init` and `publish` commands (feat01-repo-write-commands)
- GitHub API with `repo` scope for tag/release creation

## Out of Scope (Future)

- Automatic version bumping based on changes
- Pre-release versions (1.0.0-beta.1)
- Version ranges for installation (^1.0.0)
- Automatic changelog generation
- Version deprecation/yanking
