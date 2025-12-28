/**
 * GitHub OAuth Device Flow implementation
 * Reference: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */

// ============================================================================
// GitHub App Installation Types
// ============================================================================

export interface Installation {
  id: number;
  account: {
    login: string;
    type: "User" | "Organization";
  };
  repository_selection: "all" | "selected";
  permissions: Record<string, string>;
}

// ============================================================================
// OAuth Device Flow Types
// ============================================================================

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface OAuthError {
  error: string;
  error_description?: string;
}

// Internal type for API responses (can be success or error)
type DeviceCodeApiResponse = DeviceCodeResponse & Partial<OAuthError>;
type AccessTokenApiResponse = AccessTokenResponse & Partial<OAuthError>;

export type PollResult =
  | { status: "success"; token: AccessTokenResponse }
  | { status: "pending" }
  | { status: "slow_down"; newInterval: number }
  | { status: "expired" }
  | { status: "access_denied" }
  | { status: "error"; message: string };

const DEVICE_CODE_URL = "https://github.com/login/device/code";
const ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";

/**
 * Request a device code from GitHub
 * This is the first step in the device flow
 */
export async function requestDeviceCode(
  clientId: string,
  scope: string = "repo"
): Promise<DeviceCodeResponse> {
  const response = await fetch(DEVICE_CODE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      scope,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request device code: ${response.status}`);
  }

  const data = (await response.json()) as DeviceCodeApiResponse;

  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return data;
}

/**
 * Poll GitHub for the access token
 * Returns the poll result which can be:
 * - success: user authorized, token received
 * - pending: user hasn't authorized yet
 * - slow_down: polling too fast, increase interval
 * - expired: device code expired
 * - access_denied: user denied authorization
 * - error: other error occurred
 */
export async function pollForAccessToken(
  clientId: string,
  deviceCode: string
): Promise<PollResult> {
  const response = await fetch(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }),
  });

  if (!response.ok) {
    return {
      status: "error",
      message: `HTTP error: ${response.status}`,
    };
  }

  const data = (await response.json()) as AccessTokenApiResponse;

  // Check for error responses
  if (data.error) {
    switch (data.error) {
      case "authorization_pending":
        return { status: "pending" };
      case "slow_down":
        // GitHub requires adding 5 seconds to the interval
        return { status: "slow_down", newInterval: 5 };
      case "expired_token":
        return { status: "expired" };
      case "access_denied":
        return { status: "access_denied" };
      default:
        return {
          status: "error",
          message: data.error_description || data.error,
        };
    }
  }

  // Success - we got the token
  return {
    status: "success",
    token: data,
  };
}

/**
 * Helper to sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll for access token with automatic retry
 * This handles the full polling loop until success, timeout, or error
 */
export async function pollUntilComplete(
  clientId: string,
  deviceCode: string,
  expiresIn: number,
  initialInterval: number,
  onPoll?: (attempt: number) => void
): Promise<
  | { success: true; token: AccessTokenResponse }
  | { success: false; reason: "expired" | "denied" | "error"; message?: string }
> {
  const startTime = Date.now();
  const expiresAt = startTime + expiresIn * 1000;
  let interval = initialInterval;
  let attempt = 0;

  while (Date.now() < expiresAt) {
    await sleep(interval * 1000);
    attempt++;

    if (onPoll) {
      onPoll(attempt);
    }

    const result = await pollForAccessToken(clientId, deviceCode);

    switch (result.status) {
      case "success":
        return { success: true, token: result.token };
      case "pending":
        // Continue polling
        break;
      case "slow_down":
        interval += result.newInterval;
        break;
      case "expired":
        return { success: false, reason: "expired" };
      case "access_denied":
        return { success: false, reason: "denied" };
      case "error":
        return { success: false, reason: "error", message: result.message };
    }
  }

  return { success: false, reason: "expired" };
}

/**
 * Open URL in the default browser
 */
export async function openBrowser(url: string): Promise<void> {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  // Determine the command based on the platform
  const platform = process.platform;
  let command: string;

  if (platform === "darwin") {
    command = `open "${url}"`;
  } else if (platform === "win32") {
    command = `start "" "${url}"`;
  } else {
    // Linux and others
    command = `xdg-open "${url}"`;
  }

  await execAsync(command);
}

// ============================================================================
// GitHub App Installation Management
// ============================================================================

const GITHUB_API_URL = "https://api.github.com";

interface InstallationsResponse {
  total_count: number;
  installations: Installation[];
}

/**
 * Get all GitHub App installations for the authenticated user
 */
export async function getUserInstallations(
  userToken: string
): Promise<Installation[]> {
  const response = await fetch(`${GITHUB_API_URL}/user/installations`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${userToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get installations: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as InstallationsResponse;
  return data.installations;
}
