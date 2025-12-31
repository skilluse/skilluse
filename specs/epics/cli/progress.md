# CLI Epic Progress

## Current Status
All core CLI features completed. Adding write support with repo init and publish commands.

---

## New Features Sprint

### [2025-12-31] Created feat01-repo-write-commands
- **Goal**: Add write capabilities to complete the skill ecosystem
- **Commands**:
  - `skilluse repo init <username/repo>` - Create skills repository on GitHub
  - `skilluse publish <skill-path>` - Publish local skill to repository
- **Key Options**:
  - repo init: `--public` (default), `--private`, `--path <path>` (default: skills)
  - publish: `-r, --repo`, `--pr`
- **Features**: 13 acceptance criteria defined

---

## Refactoring Sprint

### [2025-12-31] Completed refactor01-agent-command
- **Problem**: `skilluse agent use claude` is verbose (3 words)
- **Solution**: Simplify to `skilluse agent claude` (2 words)
- **Enhancement**: `skilluse agent` (no args) now shows interactive selection with arrow keys
- **Changes**:
  - Merged `agent/use.tsx` into `agent/index.tsx`
  - Removed `agent use` subcommand from `cli.tsx`
  - Added interactive `Select` component for agent selection
  - Deleted `agent/use.tsx`

---

## Authentication Sprint

### [2025-12-30] Created auth01-optional-authentication
- **Problem**: All commands require authentication, even for public repo access
- **Analysis**: GitHub API allows unauthenticated access to public repos (60 req/hr)
- **Solution**: Make token optional, handle 401/403 gracefully, improve error messages
- **Scope**: 12 commands affected, need helper functions for cleaner implementation

---

## Bug Fixes Sprint

### [2025-12-30] Updated bug01-ink-static-component
- **Problem**: Ink clears dynamic output when `exit()` is called, causing race condition
- **Symptom**: Commands show "Loading..." then exit without showing output
- **Root Cause**: `exit()` called immediately after `setState()` - React doesn't render before exit

**Already Fixed (7 commands)**:
- repo/list.tsx, repo/index.tsx, repo/use.tsx - reference implementations
- agent/index.tsx, agent/use.tsx, logout.tsx - fixed previously
- list.tsx - fixed in v0.2.1

**Need Fix (10 commands)**:
- HIGH: repo/remove, repo/edit, search, info
- MEDIUM: install, upgrade, uninstall
- LOW: index, repo/add, login

**Fix Pattern**:
```tsx
// 1. Add outputItems state
const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

// 2. Set outputItems when state is final (don't call exit() here)
useEffect(() => {
  if (isFinalState && outputItems.length === 0) {
    setOutputItems([{ id: "output" }]);
  }
}, [state.phase, outputItems.length]);

// 3. Exit after outputItems is rendered
useEffect(() => {
  if (outputItems.length > 0) {
    process.nextTick(() => exit());
  }
}, [outputItems.length, exit]);

// 4. Wrap output in <Static>
<Static items={outputItems}>{(item) => <Box key={item.id}>...</Box>}</Static>
```

## Completed Sprints

### Multi-Agent Support Sprint
- [x] task14-multi-agent-support - Support multiple AI agents with agent-specific paths

#### [2025-12-29] Session #1 - task14-multi-agent-support
- Completed: F001-F012
- Notes:
  - Created services/agents.ts with AgentConfig and 9 supported agents
  - Added currentAgent to store.ts with getter/setter (default: claude)
  - Created agent command group: agent (list) and agent use <id>
  - Updated install command to use current agent's path and --agent flag
  - Updated list command with --all flag to show skills for all agents
  - Updated uninstall to filter by current agent
  - Added unified install source parsing: repo name, owner/repo, owner/repo/path, local path
  - Added local path installation with fs.cp
  - Updated status command to show current agent and skill count

---

### Skill Installation Sprint
- [x] task09-skill-install - Skill installation commands

#### [2025-12-28] Session #2 - CLI cleanup and Biome setup
- Notes:
  - Removed redundant commands: repos, whoami, skills, demo, repo sync
  - Removed unused code: getInstallationRepositories, getInstallationToken
  - Updated README.md with current 12 commands
  - Added Biome for formatting and linting (replaces Prettier/ESLint)
  - Fixed all lint issues: node:protocol imports, unused imports, useCallback

#### [2025-12-28] Session #1 - task09-skill-install
- Completed: F001-F008
- Commits: 87e5d93
- Notes:
  - Created install.tsx for downloading skills from GitHub to local/global .claude/skills/
  - Created uninstall.tsx with confirmation prompt and --force flag
  - Created upgrade.tsx to check for updates and re-download files
  - Created info.tsx to show skill metadata from SKILL.md frontmatter
  - Updated list.tsx with --outdated flag to check for skill updates
  - All commands include progress UI with step indicators and progress bar
  - Tracks commit SHA for version comparison

---

### Bun Build & Release Sprint
- [x] build01-bun-release - Bun build & multi-platform release

#### [2025-12-28] Session - build01-bun-release
- Completed: F001-F010
- Notes:
  - Migrated development workflow to Bun (bun install, bun run dev/build/typecheck)
  - Created src/cli.tsx for static command imports (Pastel uses dynamic fs scanning)
  - Created scripts/build-all.ts for cross-platform builds (6 targets)
  - Created .github/workflows/release.yml for automated releases
  - Created .github/workflows/ci.yml for PR checks
  - Created scripts/install.sh for native installation
  - Updated package.json with NPM publish configuration
  - Created docs/homebrew/skilluse.rb formula template
  - Added version management with --version-verbose for build time
  - Release workflow generates SHA256 checksums

---

### CLI Polish Sprint
- [x] task12-cli-polish - Error handling & onboarding

#### [2025-12-28] Session - task12-cli-polish
- Completed: F001-F009
- Notes:
  - Created CLIError component for structured error messages with causes and suggestions
  - Updated repo remove to use CLIError and show affected skills count
  - Updated not_logged_in state to show welcome onboarding with numbered steps
  - Created update.ts service to check npm registry for newer versions
  - Version check cached for 24 hours to avoid slowing down CLI
  - Fixed version to read from package.json instead of hardcoded value

---

### GitHub App Migration Sprint
- [x] task01-create-github-app
- [x] task02-oauth-service
- [x] task03-credential-storage
- [x] task04-cli-commands
- [x] task05-testing-cleanup

#### [2025-12-27] Session - task05-testing-cleanup
- Completed: F001-F006
- Notes:
  - Tested fresh install flow: OAuth device flow works, token stored in keychain
  - Tested returning user flow: Shows "Already logged in" with --force option
  - Verified repos command handles no-installation case properly
  - Fixed GitHub App install URL in login.tsx (skilluse-cli -> skilluse)
  - Created packages/cli/README.md with full authentication documentation

#### [2025-12-27] Session - task04-cli-commands
- Completed: F001-F007
- Notes:
  - Updated login command to fetch and store GitHub App installations after OAuth
  - Converts Installation[] to StoredInstallation[] and saves via setInstallations()
  - If single installation, sets as default automatically
  - Updated logout to use clearAllCredentials() and clearInstallations()
  - Updated whoami to display installations with repository selection info
  - Created repos command to list accessible repositories grouped by installation

#### [2025-12-27] Session - task03-credential-storage
- Completed: F001-F006
- Commits: 44e33a7
- Notes:
  - Added UserCredentials interface and setUserCredentials/getUserCredentials
  - Added StoredInstallation type and setInstallations/getInstallations
  - Added setDefaultInstallation/getDefaultInstallation
  - Added in-memory InstallationTokenCache with expiry handling
  - Storage: user token in keychain, installations in config JSON, token cache in memory

#### [2025-12-27] Session - task02-oauth-service
- Completed: F001-F006
- Commits: cc4e3ef
- Notes:
  - Added GitHub App installation types: Installation, Repository, InstallationToken
  - Implemented getUserInstallations(), getInstallationRepositories(), getInstallationToken()
  - Updated login command to use GitHub App client ID

---

### Config Refactor Sprint
- [x] cfg01-platform-paths
- [x] cfg02-secure-credentials
- [~] cfg03-config-migration (skipped - product not released)

#### [2025-12-27] Session - cfg02-secure-credentials
- Completed: F001-F006
- Notes:
  - Added keytar package for system keychain support
  - Created credentials.ts service with getCredentials, setCredentials, clearCredentials
  - Keychain used on macOS Keychain, Windows Credential Manager, Linux libsecret
  - Encrypted file fallback using AES-256-GCM when keychain unavailable

---

### CLI Core Sprint

#### [2025-12-27] Session #1 - task02-ui-components
- Completed: F001-F006
- Commits: 613ad7c
- Notes:
  - Upgraded ink to v5 for compatibility
  - Created custom Table, ProgressBar, StatusMessage components
  - Added demo command for testing components

#### [2025-12-27] Session #2 - task03-oauth-flow
- Completed: F001-F005
- Commits: 5110081
- Notes:
  - Created oauth.ts service with GitHub Device Flow implementation
  - requestDeviceCode(), pollForAccessToken(), pollUntilComplete()
  - openBrowser() provides cross-platform browser opening

#### [2025-12-27] Session #3 - task05-config-store
- Completed: F001-F006
- Commits: c3ef7eb
- Notes:
  - Created store.ts service using conf library
  - Config stored at ~/.skilluse/config.json

#### [2025-12-27] Session #4 - task04-auth-commands
- Completed: F001-F005
- Notes:
  - Created login.tsx, logout.tsx, whoami.tsx commands
  - OAuth client ID configurable via SKILLUSE_GITHUB_CLIENT_ID env var
