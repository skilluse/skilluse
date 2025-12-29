/**
 * Credential storage service.
 *
 * Stores OAuth tokens in a plain JSON file with restricted permissions (0600).
 * This follows the same pattern as gh, aws, npm, and docker CLIs.
 *
 * Storage location (via env-paths):
 * - macOS: ~/Library/Application Support/skilluse/auth.json
 * - Linux: ~/.config/skilluse/auth.json
 * - Windows: %APPDATA%/skilluse/auth.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { configPath } from "./paths.js";

const AUTH_FILE = "auth.json";

/** @deprecated Use UserCredentials instead */
export interface Credentials {
	token: string;
	user: string;
}

export interface UserCredentials {
	token: string;
	userName: string;
}

export interface InstallationTokenCache {
	installationId: number;
	token: string;
	expiresAt: Date;
}

interface AuthFile {
	_comment: string;
	token: string;
	userName: string;
}

// In-memory cache for short-lived installation tokens
const installationTokenCache = new Map<number, InstallationTokenCache>();

function getAuthFilePath(): string {
	return path.join(configPath, AUTH_FILE);
}

/**
 * Get stored credentials from auth file.
 */
export async function getCredentials(): Promise<Credentials | null> {
	try {
		const filePath = getAuthFilePath();
		const content = await fs.readFile(filePath, "utf8");
		const auth = JSON.parse(content) as AuthFile;

		if (auth.token && auth.userName) {
			return { token: auth.token, user: auth.userName };
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Store credentials in auth file with restricted permissions.
 */
export async function setCredentials(
	token: string,
	user: string,
): Promise<void> {
	const auth: AuthFile = {
		_comment:
			"GitHub OAuth token for skilluse CLI. Revoke at: https://github.com/settings/apps/authorizations",
		token,
		userName: user,
	};

	// Ensure config directory exists
	await fs.mkdir(configPath, { recursive: true });

	const filePath = getAuthFilePath();
	await fs.writeFile(filePath, JSON.stringify(auth, null, 2), { mode: 0o600 });
}

/**
 * Clear stored credentials.
 */
export async function clearCredentials(): Promise<void> {
	try {
		const filePath = getAuthFilePath();
		await fs.unlink(filePath);
	} catch {
		// Ignore errors (file may not exist)
	}
}

// ============================================================================
// New GitHub App Credential Functions
// ============================================================================

/**
 * Store user credentials (token and username) securely.
 */
export async function setUserCredentials(
	token: string,
	userName: string,
): Promise<void> {
	await setCredentials(token, userName);
}

/**
 * Get user credentials from storage.
 */
export async function getUserCredentials(): Promise<UserCredentials | null> {
	const creds = await getCredentials();
	if (!creds) return null;
	return {
		token: creds.token,
		userName: creds.user,
	};
}

// ============================================================================
// Installation Token Cache (in-memory, short-lived)
// ============================================================================

/**
 * Get cached installation token if it exists and is not expired.
 * Returns null if no valid token is cached.
 */
export function getCachedInstallationToken(
	installationId: number,
): InstallationTokenCache | null {
	const cached = installationTokenCache.get(installationId);
	if (!cached) return null;

	// Check if token is expired (with 5 minute buffer for safety)
	const bufferMs = 5 * 60 * 1000;
	if (new Date(cached.expiresAt).getTime() - bufferMs < Date.now()) {
		// Token is expired or about to expire, remove it
		installationTokenCache.delete(installationId);
		return null;
	}

	return cached;
}

/**
 * Cache an installation token.
 */
export function setCachedInstallationToken(
	cache: InstallationTokenCache,
): void {
	installationTokenCache.set(cache.installationId, cache);
}

/**
 * Clear all cached installation tokens.
 */
export function clearInstallationTokenCache(): void {
	installationTokenCache.clear();
}

/**
 * Clear all credentials: user token, and installation token cache.
 * Note: Installation list and default installation are cleared via store.ts
 */
export async function clearAllCredentials(): Promise<void> {
	// Clear user credentials
	await clearCredentials();

	// Clear installation token cache
	clearInstallationTokenCache();
}
