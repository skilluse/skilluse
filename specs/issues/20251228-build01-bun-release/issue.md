# Bun Build & Multi-Platform Release

## Overview
Migrate development tooling to Bun and set up a complete release pipeline supporting three installation methods: Native binary, Homebrew, and NPM. Reference Claude Code's installation approach.

## Background

Claude Code supports three installation methods:
1. **Native Install** - Single binary, no dependencies (recommended)
2. **Homebrew** - `brew install --cask claude-code`
3. **NPM** - `npm install -g @anthropic-ai/claude-code`

We will implement the same pattern for skilluse.

## References (2025 Best Practices)
- [Bun Single-file Executable Docs](https://bun.com/docs/bundler/executables)
- [Bun 1.3 Release Notes](https://bun.com/blog/bun-v1.3) - Programmatic compilation API
- [Bun 1.3.5 Feature Flags](https://bun.com/blog/bun-v1.3.5) - Compile-time feature flags

## Requirements

### 1. Migrate Development to Bun

Replace Node.js + TypeScript workflow with Bun:

```bash
# Before
npm install
npm run build  # tsc
npm run dev    # tsc -w

# After
bun install
bun run build  # bun build
bun run dev    # bun --watch
```

**Changes needed:**
- Update `package.json` scripts to use Bun
- Remove `tsc` dependency for builds (keep for type checking)
- Add `bunfig.toml` if needed
- Update `.gitignore` for Bun artifacts

### 2. Binary Compilation (Bun 1.3+ Best Practices)

Use `bun build --compile` with **production flags**:

```bash
# Build for current platform (development)
bun build ./src/index.ts --compile --outfile dist/skilluse

# Production build with minification and sourcemaps
bun build ./src/index.ts --compile --minify --sourcemap --outfile dist/skilluse

# With build-time constants (Bun 1.2+)
bun build ./src/index.ts --compile --minify --sourcemap \
  --define:VERSION='"0.1.0"' \
  --define:BUILD_TIME="\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" \
  --outfile dist/skilluse
```

**All Available Targets (Bun 1.3):**

| Target | OS | Arch | Notes |
|--------|-----|------|-------|
| `bun-darwin-arm64` | macOS | ARM64 | Apple Silicon (M1/M2/M3) |
| `bun-darwin-x64` | macOS | x64 | Intel Macs |
| `bun-linux-x64` | Linux | x64 | Default, AVX2 required |
| `bun-linux-x64-baseline` | Linux | x64 | Pre-2013 CPUs (no AVX2) |
| `bun-linux-arm64` | Linux | ARM64 | AWS Graviton, Raspberry Pi |
| `bun-linux-x64-musl` | Linux | x64 | Alpine Linux |
| `bun-linux-arm64-musl` | Linux | ARM64 | Alpine ARM64 |
| `bun-windows-x64` | Windows | x64 | Default, AVX2 required |
| `bun-windows-x64-baseline` | Windows | x64 | Pre-2013 CPUs |

**Recommended targets for distribution:**
```bash
# Cross-compile for all major platforms
bun build ./src/index.ts --compile --minify --sourcemap --target=bun-linux-x64 --outfile dist/skilluse-linux-x64
bun build ./src/index.ts --compile --minify --sourcemap --target=bun-linux-x64-baseline --outfile dist/skilluse-linux-x64-baseline
bun build ./src/index.ts --compile --minify --sourcemap --target=bun-linux-arm64 --outfile dist/skilluse-linux-arm64
bun build ./src/index.ts --compile --minify --sourcemap --target=bun-darwin-x64 --outfile dist/skilluse-darwin-x64
bun build ./src/index.ts --compile --minify --sourcemap --target=bun-darwin-arm64 --outfile dist/skilluse-darwin-arm64
bun build ./src/index.ts --compile --minify --sourcemap --target=bun-windows-x64 --outfile dist/skilluse-windows-x64.exe
```

**Binary Size Note:** Compiled binaries are ~50-90MB due to embedded Bun runtime. Use `--minify` to reduce bundled code size.

### 3. GitHub Actions Release Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

env:
  BUN_VERSION: "1.3"  # Pin to stable version

jobs:
  build:
    strategy:
      matrix:
        include:
          # Linux builds (can cross-compile from ubuntu)
          - os: ubuntu-latest
            target: bun-linux-x64
            artifact: skilluse-linux-x64
          - os: ubuntu-latest
            target: bun-linux-x64-baseline
            artifact: skilluse-linux-x64-baseline
          - os: ubuntu-latest
            target: bun-linux-arm64
            artifact: skilluse-linux-arm64
          # macOS builds
          - os: macos-latest
            target: bun-darwin-x64
            artifact: skilluse-darwin-x64
          - os: macos-14  # ARM64 runner
            target: bun-darwin-arm64
            artifact: skilluse-darwin-arm64
          # Windows builds
          - os: windows-latest
            target: bun-windows-x64
            artifact: skilluse-windows-x64.exe

    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: ${{ env.BUN_VERSION }}

      - name: Install dependencies
        run: bun install --frozen-lockfile
        working-directory: packages/cli

      - name: Build binary
        run: |
          bun build ./src/index.ts --compile --minify --sourcemap \
            --define:VERSION='"${{ github.ref_name }}"' \
            --define:BUILD_TIME='"${{ github.event.head_commit.timestamp }}"' \
            --target=${{ matrix.target }} \
            --outfile dist/${{ matrix.artifact }}
        working-directory: packages/cli

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.artifact }}
          path: packages/cli/dist/${{ matrix.artifact }}

  release:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: artifacts
          merge-multiple: true

      - name: Generate checksums
        run: |
          cd artifacts
          sha256sum skilluse-* > checksums-sha256.txt
          cat checksums-sha256.txt

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            artifacts/skilluse-*
            artifacts/checksums-sha256.txt
          generate_release_notes: true
          draft: false
          prerelease: ${{ contains(github.ref_name, 'beta') || contains(github.ref_name, 'alpha') }}

  npm:
    needs: release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: ${{ env.BUN_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install and build for NPM
        run: |
          bun install --frozen-lockfile
          bun run build
        working-directory: packages/cli

      - name: Publish to NPM
        run: npm publish --access public
        working-directory: packages/cli
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 4. Installation Scripts

Create `install.sh` for native installation:

```bash
#!/bin/bash
set -e

REPO="user/skilluse"
INSTALL_DIR="${HOME}/.local/bin"

# Detect platform
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
  darwin) OS="darwin" ;;
  linux) OS="linux" ;;
  *) echo "Unsupported OS: $OS"; exit 1 ;;
esac

case "$ARCH" in
  x86_64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

BINARY="skilluse-${OS}-${ARCH}"
VERSION=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

echo "Installing skilluse ${VERSION} for ${OS}-${ARCH}..."

mkdir -p "$INSTALL_DIR"
curl -fsSL "https://github.com/${REPO}/releases/download/${VERSION}/${BINARY}" -o "${INSTALL_DIR}/skilluse"
chmod +x "${INSTALL_DIR}/skilluse"

echo "Installed to ${INSTALL_DIR}/skilluse"
echo "Make sure ${INSTALL_DIR} is in your PATH"
```

### 5. Homebrew Formula

Create Homebrew tap repository `homebrew-skilluse`:

```ruby
# Formula/skilluse.rb
class Skilluse < Formula
  desc "CLI tool for managing AI Coding Agent Skills"
  homepage "https://github.com/user/skilluse"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/user/skilluse/releases/download/v#{version}/skilluse-darwin-arm64"
      sha256 "PLACEHOLDER"
    end
    on_intel do
      url "https://github.com/user/skilluse/releases/download/v#{version}/skilluse-darwin-x64"
      sha256 "PLACEHOLDER"
    end
  end

  on_linux do
    url "https://github.com/user/skilluse/releases/download/v#{version}/skilluse-linux-x64"
    sha256 "PLACEHOLDER"
  end

  def install
    binary_name = "skilluse-#{OS.mac? ? "darwin" : "linux"}-#{Hardware::CPU.arm? ? "arm64" : "x64"}"
    bin.install binary_name => "skilluse"
  end

  test do
    system "#{bin}/skilluse", "--version"
  end
end
```

## Technical Details

### Updated package.json Scripts

```json
{
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "build:bin": "bun build src/index.ts --compile --outfile dist/skilluse",
    "build:all": "bun run scripts/build-all.ts",
    "typecheck": "tsc --noEmit",
    "start": "bun dist/index.js",
    "prepublishOnly": "bun run build"
  }
}
```

### Build Script (scripts/build-all.ts)

```typescript
import { $ } from "bun";

const targets = [
  { target: "bun-linux-x64", output: "skilluse-linux-x64" },
  { target: "bun-darwin-x64", output: "skilluse-darwin-x64" },
  { target: "bun-darwin-arm64", output: "skilluse-darwin-arm64" },
  { target: "bun-windows-x64", output: "skilluse-windows-x64.exe" },
];

for (const { target, output } of targets) {
  console.log(`Building for ${target}...`);
  await $`bun build src/index.ts --compile --target=${target} --outfile=dist/${output}`;
}

console.log("All builds complete!");
```

### Version Management

Add version to CLI output:

```typescript
// src/version.ts
export const VERSION = "0.1.0";

// Read from package.json at build time
import pkg from "../package.json";
export const VERSION = pkg.version;
```

## File Structure

```
packages/cli/
├── src/
│   ├── index.ts
│   └── version.ts
├── scripts/
│   └── build-all.ts
├── dist/                    # Build output (gitignored)
├── package.json
├── tsconfig.json
└── bunfig.toml              # Optional Bun config

.github/
└── workflows/
    ├── ci.yml               # PR checks
    └── release.yml          # Release pipeline

scripts/
├── install.sh               # Native installer
└── install.ps1              # Windows installer
```

## Implementation Order

1. **Phase 1: Bun Migration**
   - Update package.json scripts
   - Test development workflow with Bun
   - Verify existing functionality works

2. **Phase 2: Binary Build**
   - Add `bun build --compile` script
   - Test binary on local machine
   - Add version display to CLI

3. **Phase 3: CI/CD Pipeline**
   - Create release.yml workflow
   - Set up NPM_TOKEN secret
   - Test release with v0.1.0-beta.1

4. **Phase 4: Installation Methods**
   - Create install.sh script
   - Host on GitHub Pages or include in repo
   - Create Homebrew tap (separate repo)

## Acceptance Criteria
See `features.json` for testable criteria.

## Dependencies
- [x] task01-project-setup
- [x] task12-cli-polish (for version display)

## Out of Scope
- Auto-update mechanism (future ticket)
- Code signing for binaries
- Windows native installer (.msi)
- Linux package managers (apt, yum)
