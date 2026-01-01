/**
 * GitHub API helper functions for optional authentication
 *
 * GitHub allows unauthenticated access to public repositories with rate limits:
 * - Unauthenticated: 60 requests per hour
 * - Authenticated: 5000 requests per hour
 */

type Headers = Record<string, string>;

/**
 * Build GitHub API headers with optional authentication token
 */
export function buildGitHubHeaders(token?: string): Headers {
	const headers: Headers = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
}

/**
 * Build GitHub API headers for raw content requests with optional authentication
 */
export function buildGitHubRawHeaders(token?: string): Headers {
	const headers: Headers = {
		Accept: "application/vnd.github.raw+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
}

/**
 * Check if a response indicates authentication is required (private repo)
 */
export function isAuthRequired(response: Response): boolean {
	return (
		response.status === 401 ||
		(response.status === 403 && !isRateLimited(response))
	);
}

/**
 * Check if a response indicates rate limiting
 */
export function isRateLimited(response: Response): boolean {
	return response.headers.get("X-RateLimit-Remaining") === "0";
}

/**
 * Get a user-friendly error message for GitHub API errors
 */
export function getGitHubErrorMessage(response: Response): string {
	if (response.status === 401) {
		return "Authentication required: This appears to be a private repository.";
	}

	if (response.status === 403) {
		if (isRateLimited(response)) {
			const resetTime = response.headers.get("X-RateLimit-Reset");
			const resetInfo = resetTime
				? ` (resets at ${new Date(Number(resetTime) * 1000).toLocaleTimeString()})`
				: "";
			return `Rate limit exceeded${resetInfo}. Login for higher limits (5000/hr vs 60/hr).`;
		}
		return "Authentication required: Access denied to this repository.";
	}

	if (response.status === 404) {
		return "Repository not found. Check the owner/repo name or it may be private.";
	}

	return `GitHub API error: ${response.status}`;
}
