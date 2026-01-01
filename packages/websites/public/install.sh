#!/bin/bash
# Skilluse CLI Installer
# Usage: curl -fsSL https://skilluse.dev/install.sh | bash
set -e

REPO="skilluse/skilluse"
INSTALL_DIR="${HOME}/.local/bin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() {
  echo -e "${GREEN}[info]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[warn]${NC} $1"
}

error() {
  echo -e "${RED}[error]${NC} $1"
  exit 1
}

# Detect platform
detect_platform() {
  local os arch

  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)

  case "$os" in
    darwin) os="darwin" ;;
    linux) os="linux" ;;
    mingw*|msys*|cygwin*)
      error "Windows is not supported by this installer. Use: npm install -g skilluse"
      ;;
    *) error "Unsupported OS: $os" ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) error "Unsupported architecture: $arch" ;;
  esac

  echo "${os}-${arch}"
}

# Get latest version from GitHub
get_latest_version() {
  local version
  version=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

  if [ -z "$version" ]; then
    error "Failed to fetch latest version from GitHub"
  fi

  echo "$version"
}

# Verify checksum
verify_checksum() {
  local binary_path="$1"
  local expected_checksum="$2"

  if command -v sha256sum &> /dev/null; then
    local actual_checksum
    actual_checksum=$(sha256sum "$binary_path" | cut -d' ' -f1)
    if [ "$actual_checksum" != "$expected_checksum" ]; then
      error "Checksum verification failed!"
    fi
    info "Checksum verified"
  elif command -v shasum &> /dev/null; then
    local actual_checksum
    actual_checksum=$(shasum -a 256 "$binary_path" | cut -d' ' -f1)
    if [ "$actual_checksum" != "$expected_checksum" ]; then
      error "Checksum verification failed!"
    fi
    info "Checksum verified"
  else
    warn "sha256sum/shasum not found, skipping checksum verification"
  fi
}

main() {
  info "Detecting platform..."
  local platform
  platform=$(detect_platform)
  info "Platform: $platform"

  info "Fetching latest version..."
  local version
  version=$(get_latest_version)
  info "Latest version: $version"

  local binary_name="skilluse-${platform}"
  local download_url="https://github.com/${REPO}/releases/download/${version}/${binary_name}"
  local checksums_url="https://github.com/${REPO}/releases/download/${version}/checksums-sha256.txt"

  info "Creating install directory: $INSTALL_DIR"
  mkdir -p "$INSTALL_DIR"

  local tmp_dir
  tmp_dir=$(mktemp -d)
  trap "rm -rf $tmp_dir" EXIT

  info "Downloading $binary_name..."
  if ! curl -fSL "$download_url" -o "$tmp_dir/skilluse"; then
    error "Failed to download binary from $download_url"
  fi

  # Download and verify checksum
  info "Downloading checksums..."
  if curl -fsSL "$checksums_url" -o "$tmp_dir/checksums.txt" 2>/dev/null; then
    local expected_checksum
    expected_checksum=$(grep "$binary_name" "$tmp_dir/checksums.txt" | cut -d' ' -f1)
    if [ -n "$expected_checksum" ]; then
      verify_checksum "$tmp_dir/skilluse" "$expected_checksum"
    else
      warn "Binary not found in checksums file"
    fi
  else
    warn "Could not download checksums file, skipping verification"
  fi

  info "Installing to $INSTALL_DIR/skilluse..."
  chmod +x "$tmp_dir/skilluse"
  mv "$tmp_dir/skilluse" "$INSTALL_DIR/skilluse"

  # Check if install dir is in PATH
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    warn "$INSTALL_DIR is not in your PATH"
    echo ""
    echo "Add the following to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
    echo ""
    echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
    echo ""
  fi

  info "Installation complete!"
  echo ""
  echo "Run 'skilluse --help' to get started"
}

main "$@"
