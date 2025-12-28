# Homebrew Installation

## Installation

To install Skilluse via Homebrew, first add the tap:

```bash
brew tap jiweiyuan/skilluse
```

Then install:

```bash
brew install skilluse
```

## Updating

```bash
brew upgrade skilluse
```

## Uninstalling

```bash
brew uninstall skilluse
```

## Creating the Tap Repository

To publish this formula, create a new repository named `homebrew-skilluse` with the following structure:

```
homebrew-skilluse/
└── Formula/
    └── skilluse.rb
```

Copy the `skilluse.rb` formula to `Formula/skilluse.rb` in the tap repository.

### Updating SHA256 Checksums

For each release, update the SHA256 checksums in the formula. Get them from the `checksums-sha256.txt` file in the GitHub release, or calculate them:

```bash
# Download binaries
curl -LO https://github.com/jiweiyuan/skilluse/releases/download/vX.Y.Z/skilluse-darwin-arm64
curl -LO https://github.com/jiweiyuan/skilluse/releases/download/vX.Y.Z/skilluse-darwin-x64
curl -LO https://github.com/jiweiyuan/skilluse/releases/download/vX.Y.Z/skilluse-linux-arm64
curl -LO https://github.com/jiweiyuan/skilluse/releases/download/vX.Y.Z/skilluse-linux-x64

# Calculate checksums
shasum -a 256 skilluse-*
```

Replace the `PLACEHOLDER_SHA256_*` values in the formula with the actual checksums.
