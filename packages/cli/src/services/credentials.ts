/**
 * Secure credential storage service.
 *
 * Stores OAuth tokens securely using:
 * 1. System keychain (preferred) - macOS Keychain, Windows Credential Manager, Linux libsecret
 * 2. Encrypted file fallback - when keychain is unavailable
 */

import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import keytar from "keytar";
import { dataPath } from "./paths.js";

const SERVICE_NAME = "skilluse";
const CREDENTIALS_FILE = "credentials.enc";

export interface Credentials {
  token: string;
  user: string;
}

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
  user: string
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
  user: string
): Promise<void> {
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
  user: string
): Promise<void> {
  const credentials: Credentials = { token, user };
  const encrypted = encrypt(JSON.stringify(credentials));

  // Ensure data directory exists
  await fs.mkdir(dataPath, { recursive: true });

  const filePath = path.join(dataPath, CREDENTIALS_FILE);
  await fs.writeFile(filePath, encrypted, { mode: 0o600 }); // Owner read/write only
}
