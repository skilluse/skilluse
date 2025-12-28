# Homebrew Formula for Skilluse CLI
# To use this formula, create a tap repository: homebrew-skilluse
# Then users can install with: brew install jiweiyuan/skilluse/skilluse
#
# This formula downloads pre-built binaries from GitHub releases.
# SHA256 checksums must be updated for each release.

class Skilluse < Formula
  desc "CLI tool for managing and installing AI Coding Agent Skills"
  homepage "https://github.com/jiweiyuan/skilluse"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/jiweiyuan/skilluse/releases/download/v#{version}/skilluse-darwin-arm64"
      sha256 "PLACEHOLDER_SHA256_DARWIN_ARM64"

      def install
        bin.install "skilluse-darwin-arm64" => "skilluse"
      end
    end

    on_intel do
      url "https://github.com/jiweiyuan/skilluse/releases/download/v#{version}/skilluse-darwin-x64"
      sha256 "PLACEHOLDER_SHA256_DARWIN_X64"

      def install
        bin.install "skilluse-darwin-x64" => "skilluse"
      end
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/jiweiyuan/skilluse/releases/download/v#{version}/skilluse-linux-arm64"
      sha256 "PLACEHOLDER_SHA256_LINUX_ARM64"

      def install
        bin.install "skilluse-linux-arm64" => "skilluse"
      end
    end

    on_intel do
      url "https://github.com/jiweiyuan/skilluse/releases/download/v#{version}/skilluse-linux-x64"
      sha256 "PLACEHOLDER_SHA256_LINUX_X64"

      def install
        bin.install "skilluse-linux-x64" => "skilluse"
      end
    end
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/skilluse --version")
  end
end
