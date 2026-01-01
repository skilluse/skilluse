# Add Repo Init and Publish Commands with Version Management

## Overview

Add write capabilities to the CLI, enabling users to create skill repositories and publish skills with proper version management. Currently the CLI is read-only (search, install, list). These commands complete the skill ecosystem by allowing users to be both consumers and creators.

**Key Design Decisions:**
- Use **Git Tags** for version tracking: `{skill-name}/v{version}` (e.g., `pdf/v2.0.0`)
- Use **GitHub Releases** for reliable distribution with downloadable assets
- Each skill maintains independent versions within a shared repository

## Requirements

- `skilluse repo init <username/repo>` - Create a new skills repository on GitHub
- `skilluse publish [skill-path]` - Publish a skill with versioned release
- `skilluse install skill@version` - Install specific version (enhancement)
- Proper validation of skill structure before publishing
- GitHub API integration for repo creation, tags, and releases

## Technical Details

### Command: `repo init <username/repo>`

Creates a new GitHub repository with proper skills structure.

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| `username/repo` | Yes | Repository name in owner/repo format |

**Options:**
| Option | Default | Description |
|--------|---------|-------------|
| `--public` | Yes | Create as public repository |
| `--private` | No | Create as private repository |
| `--path <path>` | `skills` | Skills directory within repo |

**Generated Structure:**
```
my-skills/
├── README.md           # Auto-generated repo description
├── LICENSE             # MIT license (optional)
└── skills/             # Default skills directory
    └── .gitkeep
```

**API Calls:**
- `POST /user/repos` - Create repository
- `PUT /repos/{owner}/{repo}/contents/{path}` - Create initial files

---

### Command: `publish [skill-path]`

Publishes a local skill directory with versioned Git tag and GitHub Release.

**Arguments:**
| Argument | Required | Description |
|----------|----------|-------------|
| `skill-path` | No | Path to skill directory (default: current dir) |

**Options:**
| Option | Default | Description |
|--------|---------|-------------|
| `-r, --repo <name>` | default repo | Target repository (owner/repo) |
| `--version <ver>` | from SKILL.md | Override version number |
| `--draft` | No | Create as draft release |
| `--notes <text>` | Auto-generated | Release notes |

**Workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Validate Skill                                           │
│    → Check SKILL.md exists                                  │
│    → Parse frontmatter (name, version, description)         │
│    → Ensure no uncommitted changes                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Check Version Conflict                                   │
│    → GET /repos/{owner}/{repo}/git/ref/tags/{name}/v{ver}  │
│    → If exists, abort with error                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Create Git Tag                                           │
│    → git tag "{name}/v{version}"                           │
│    → git push origin "{name}/v{version}"                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Create Tarball                                           │
│    → tar czf {name}-{version}.tar.gz {skill-dir}/          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Create GitHub Release                                    │
│    → POST /repos/{owner}/{repo}/releases                   │
│    → tag_name: "{name}/v{version}"                         │
│    → name: "{name} v{version}"                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Upload Asset                                             │
│    → POST {upload_url}?name={name}-{version}.tar.gz        │
│    → Content-Type: application/gzip                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Complete                                                 │
│    ✔ Published {name} v{version}                           │
│    → https://github.com/{owner}/{repo}/releases/tag/...    │
└─────────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- SKILL.md must exist with valid YAML frontmatter
- Required fields: `name`, `description`, `version`
- Version must follow semver format (x.y.z)
- Git working directory must be clean (no uncommitted changes)

**API Calls:**
- `GET /repos/{owner}/{repo}/git/ref/tags/{tag}` - Check if version exists
- `POST /repos/{owner}/{repo}/releases` - Create release
- `POST https://uploads.github.com/.../assets` - Upload tarball

---

### Command: `install skill@version` (Enhancement)

Install a specific version of a skill.

**Examples:**
```bash
skilluse install pdf           # Install latest
skilluse install pdf@2.0.0     # Install specific version
skilluse install pdf@latest    # Explicit latest
```

**Resolution Flow:**
1. Parse version from skill name
2. If version specified:
   - Fetch release by tag: `GET /repos/.../releases/tags/{name}/v{version}`
   - Download tarball from release assets
3. If no version (latest):
   - Use existing flow (fetch from branch HEAD)

---

### Version Storage Design

**Git Tags as Version Pointers:**
```
anthropics/skills repository:
├── refs/tags/pdf/v1.0.0     → commit abc123
├── refs/tags/pdf/v2.0.0     → commit def456
├── refs/tags/commit/v1.0.0  → commit xyz789
└── refs/tags/docx/v1.2.3    → commit uvw012
```

**GitHub Releases for Distribution:**
```
Releases:
├── pdf/v2.0.0
│   └── assets: pdf-2.0.0.tar.gz (1.2 MB)
├── pdf/v1.0.0
│   └── assets: pdf-1.0.0.tar.gz (1.1 MB)
└── commit/v1.0.0
    └── assets: commit-1.0.0.tar.gz (0.5 MB)
```

**Installed Skill Tracking:**
```typescript
interface InstalledSkill {
  name: string;
  repo: string;
  version: string;        // "2.0.0"
  commitSha: string;      // For reference
  installedPath: string;
  installedFrom: "release" | "branch";  // New field
}
```

---

### Data Models

```typescript
interface RepoInitOptions {
  public: boolean;
  private: boolean;
  path: string;
}

interface PublishOptions {
  repo?: string;
  version?: string;
  draft: boolean;
  notes?: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  upload_url: string;
  html_url: string;
}

interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}
```

---

### Dependencies

- GitHub API with `repo` scope (may require re-authentication)
- `tar` module for creating tarballs (Node.js built-in or archiver package)
- Existing services: oauth.ts, github.ts, store.ts, metadata.ts

### New Files

```
packages/cli/src/
├── commands/
│   ├── repo/
│   │   └── init.tsx      # New: repo init command
│   └── publish.tsx       # New: publish command
└── services/
    └── release.ts        # New: GitHub Release API helpers
```

## Acceptance Criteria

See `feature.json` for testable criteria.

## Issue Dependencies

- None (all core CLI features completed)

## Out of Scope

- Skill validation beyond basic structure (linting, testing)
- Automatic version bumping based on git history
- Central skill registry/index management
- Team/organization permission management
- Pre-release versions (alpha, beta, rc)
- Changelog generation from commits

## Future Enhancements

- `skilluse unpublish skill@version` - Delete a release
- `skilluse versions skill` - List all available versions
- `skilluse publish --dry-run` - Preview without publishing
- Automatic changelog from conventional commits
- GitHub Actions workflow template for CI publishing
