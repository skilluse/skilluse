export {
	type Credentials,
	clearAllCredentials,
	clearCredentials,
	clearInstallationTokenCache,
	getCachedInstallationToken,
	// Legacy (deprecated)
	getCredentials,
	getUserCredentials,
	type InstallationTokenCache,
	setCachedInstallationToken,
	setCredentials,
	// New GitHub App credential functions
	setUserCredentials,
	type UserCredentials,
} from "./credentials.js";
export {
	type AccessTokenResponse,
	type DeviceCodeResponse,
	getUserInstallations,
	type Installation,
	type OAuthError,
	openBrowser,
	type PollResult,
	pollForAccessToken,
	pollUntilComplete,
	requestDeviceCode,
	sleep,
} from "./oauth.js";

export {
	cachePath,
	configPath,
	dataPath,
	logPath,
	tempPath,
} from "./paths.js";
export {
	addInstalledSkill,
	addRepo,
	type Config,
	clearInstallations,
	getConfig,
	getCurrentAgent,
	getDefaultInstallation,
	getInstallations,
	type InstalledSkill,
	type RepoConfig,
	removeInstalledSkill,
	removeRepo,
	setCurrentAgent,
	type StoredInstallation,
	setDefaultInstallation,
	setDefaultRepo,
	setInstallations,
} from "./store.js";
export {
	type AgentConfig,
	AGENTS,
	getAgent,
	getSkillsPath,
	listAgents,
} from "./agents.js";
export {
	discoverSkillPaths,
	type DiscoveryResult,
	extractParentPaths,
	type SkillPath,
} from "./discovery.js";
export {
	buildGitHubHeaders,
	buildGitHubRawHeaders,
	getGitHubErrorMessage,
	isAuthRequired,
	isRateLimited,
} from "./github.js";
