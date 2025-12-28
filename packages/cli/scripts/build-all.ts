#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
/**
 * Build binaries for all supported platforms.
 * Uses Bun's cross-compilation feature.
 */
import { $ } from "bun";

// Get version from package.json
const pkg = await Bun.file("package.json").json();
const VERSION = pkg.version;
const BUILD_TIME = new Date().toISOString();

const targets = [
	{ target: "bun-linux-x64", output: "skilluse-linux-x64" },
	{ target: "bun-linux-x64-baseline", output: "skilluse-linux-x64-baseline" },
	{ target: "bun-linux-arm64", output: "skilluse-linux-arm64" },
	{ target: "bun-darwin-x64", output: "skilluse-darwin-x64" },
	{ target: "bun-darwin-arm64", output: "skilluse-darwin-arm64" },
	{ target: "bun-windows-x64", output: "skilluse-windows-x64.exe" },
];

const distDir = "dist";

async function build() {
	// Ensure dist directory exists
	await mkdir(distDir, { recursive: true });

	console.log(`Building skilluse v${VERSION} for all platforms...\n`);

	const results: { target: string; success: boolean; error?: string }[] = [];

	for (const { target, output } of targets) {
		const outputPath = join(distDir, output);
		console.log(`Building for ${target}...`);

		try {
			await $`bun build src/cli.tsx --compile --minify --sourcemap \
        --define 'process.env.DEV="false"' \
        --define 'process.env.VERSION="${VERSION}"' \
        --define 'process.env.BUILD_TIME="${BUILD_TIME}"' \
        --target=${target} \
        --outfile=${outputPath}`.quiet();

			const stat = await Bun.file(outputPath).stat();
			const sizeMB = (stat?.size ?? 0) / 1024 / 1024;
			console.log(`  ✓ ${output} (${sizeMB.toFixed(1)} MB)`);
			results.push({ target, success: true });
		} catch (error) {
			console.log(`  ✗ ${output} - Failed`);
			results.push({
				target,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	console.log("\n--- Build Summary ---");
	const successful = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success).length;

	console.log(`✓ Successful: ${successful}/${targets.length}`);
	if (failed > 0) {
		console.log(`✗ Failed: ${failed}/${targets.length}`);
		for (const result of results.filter((r) => !r.success)) {
			console.log(`  - ${result.target}: ${result.error}`);
		}
	}

	console.log(`\nOutput directory: ${distDir}/`);

	// Exit with error if any build failed
	if (failed > 0) {
		process.exit(1);
	}
}

build();
