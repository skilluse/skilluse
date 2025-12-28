/**
 * Update notification service.
 * Checks npm registry for newer versions with daily caching.
 */

import Conf from "conf";
import { configPath } from "./paths.js";
import pkg from "../../package.json" with { type: "json" };

// Current version from package.json
const CURRENT_VERSION = pkg.version;

// Cache check for 24 hours (in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface UpdateCache {
  lastCheck: number;
  latestVersion: string | null;
}

const cache = new Conf<UpdateCache>({
  projectName: "skilluse-update",
  cwd: configPath,
  defaults: {
    lastCheck: 0,
    latestVersion: null,
  },
});

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
}

/**
 * Check if a newer version is available.
 * Uses cached result if checked within the last 24 hours.
 * Returns null if check fails or is cached.
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const lastCheck = cache.get("lastCheck");
  const cachedVersion = cache.get("latestVersion");
  const now = Date.now();

  // Return cached result if still valid
  if (lastCheck && now - lastCheck < CACHE_DURATION && cachedVersion) {
    return {
      currentVersion: CURRENT_VERSION,
      latestVersion: cachedVersion,
      hasUpdate: compareVersions(cachedVersion, CURRENT_VERSION) > 0,
    };
  }

  // Fetch latest version from npm (non-blocking)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(
      "https://registry.npmjs.org/skilluse/latest",
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      // Package might not be published yet - cache null result
      cache.set("lastCheck", now);
      cache.set("latestVersion", null);
      return null;
    }

    const data = (await response.json()) as { version: string };
    const latestVersion = data.version;

    // Cache the result
    cache.set("lastCheck", now);
    cache.set("latestVersion", latestVersion);

    return {
      currentVersion: CURRENT_VERSION,
      latestVersion,
      hasUpdate: compareVersions(latestVersion, CURRENT_VERSION) > 0,
    };
  } catch {
    // Network error or timeout - don't cache, try again next time
    return null;
  }
}

/**
 * Compare two semver versions.
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }

  return 0;
}

/**
 * Get the current CLI version.
 */
export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}
