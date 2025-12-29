/**
 * Secure credential storage service.
 *
 * Stores OAuth tokens securely using:
 * 1. System keychain (preferred) - macOS Keychain, Windows Credential Manager, Linux libsecret
 * 2. Encrypted file fallback - when keychain is unavailable
 *
 * Storage strategy:
 * - User token → Keychain/encrypted file (sensitive)
 * - Installation list → Config file JSON via store.ts (metadata)
 * - Installation token → Memory cache (short-lived, 1 hour)
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { dataPath } from "./paths.js";

// Lazy load keytar to avoid loading native module at startup
// This allows --version and other commands to run without libsecret on Linux
let keytarModule: typeof import("keytar") | null = null;

async function getKeytar() {
	if (!keytarModule) {
		keytarModule = await import("keytar");
	}
	return keytarModule;
}

const SERVICE_NAME = "skilluse";
const CREDENTIALS_FILE = "credentials.enc";

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

// In-memory cache for short-lived installation tokens
const installationTokenCache = new Map<number, InstallationTokenCache>();

// Cache keychain availability to avoid repeated checks
let keychainAvailable: boolean | null = null;

/**
 * Check if the system keychain is available and working.
 */
export async function isKeychainAvailable(): Promise<boolean> {
	if (keychainAvailable !== null) {
		return keychainAvailable;
	}

	try {
		// Try a test operation to see if keychain is working
		const keytar = await getKeytar();
		const testKey = "__keychain_test__";
		await keytar.setPassword(SERVICE_NAME, testKey, "test");
		await keytar.deletePassword(SERVICE_NAME, testKey);
		keychainAvailable = true;
	} catch {
		keychainAvailable = false;
	}

	return keychainAvailable;
}

/**
 * Get stored credentials from keychain or encrypted file.
 */
export async function getCredentials(): Promise<Credentials | null> {
	if (await isKeychainAvailable()) {
		return getCredentialsFromKeychain();
	}
	return getCredentialsFromFile();
}

/**
 * Store credentials in keychain or encrypted file.
 */
export async function setCredentials(
	token: string,
	user: string,
): Promise<void> {
	if (await isKeychainAvailable()) {
		await setCredentialsToKeychain(token, user);
	} else {
		await setCredentialsToFile(token, user);
	}
}

/**
 * Clear stored credentials from both keychain and encrypted file.
 */
export async function clearCredentials(): Promise<void> {
	// Clear from keychain
	try {
		const keytar = await getKeytar();
		await keytar.deletePassword(SERVICE_NAME, "github-token");
		await keytar.deletePassword(SERVICE_NAME, "github-user");
	} catch {
		// Ignore keychain errors
	}

	// Clear encrypted file
	try {
		const filePath = path.join(dataPath, CREDENTIALS_FILE);
		await fs.unlink(filePath);
	} catch {
		// Ignore file errors (file may not exist)
	}
}

// --- Keychain operations ---

async function getCredentialsFromKeychain(): Promise<Credentials | null> {
	try {
		const keytar = await getKeytar();
		const token = await keytar.getPassword(SERVICE_NAME, "github-token");
		const user = await keytar.getPassword(SERVICE_NAME, "github-user");

		if (token && user) {
			return { token, user };
		}
		return null;
	} catch {
		return null;
	}
}

async function setCredentialsToKeychain(
	token: string,
	user: string,
): Promise<void> {
	const keytar = await getKeytar();
	await keytar.setPassword(SERVICE_NAME, "github-token", token);
	await keytar.setPassword(SERVICE_NAME, "github-user", user);
}

// --- Encrypted file operations ---

/**
 * Derive an encryption key from machine-specific information.
 * This provides basic protection against copying the file to another machine.
 */
function deriveKey(): Buffer {
	const machineInfo = `${os.hostname()}:${os.userInfo().username}:${SERVICE_NAME}`;
	return crypto.scryptSync(machineInfo, "skilluse-salt", 32);
}

function encrypt(data: string): string {
	const key = deriveKey();
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

	let encrypted = cipher.update(data, "utf8", "hex");
	encrypted += cipher.final("hex");

	const authTag = cipher.getAuthTag();

	// Format: iv:authTag:encryptedData
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(encryptedData: string): string {
	const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

	const key = deriveKey();
	const iv = Buffer.from(ivHex, "hex");
	const authTag = Buffer.from(authTagHex, "hex");

	const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}

async function getCredentialsFromFile(): Promise<Credentials | null> {
	try {
		const filePath = path.join(dataPath, CREDENTIALS_FILE);
		const encryptedData = await fs.readFile(filePath, "utf8");
		const decrypted = decrypt(encryptedData);
		return JSON.parse(decrypted) as Credentials;
	} catch {
		return null;
	}
}

async function setCredentialsToFile(
	token: string,
	user: string,
): Promise<void> {
	const credentials: Credentials = { token, user };
	const encrypted = encrypt(JSON.stringify(credentials));

	// Ensure data directory exists
	await fs.mkdir(dataPath, { recursive: true });

	const filePath = path.join(dataPath, CREDENTIALS_FILE);
	await fs.writeFile(filePath, encrypted, { mode: 0o600 }); // Owner read/write only
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
	// Reuse existing implementation with new interface
	await setCredentials(token, userName);
}

/**
 * Get user credentials from secure storage.
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
