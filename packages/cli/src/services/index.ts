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
	isKeychainAvailable,
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
	getDefaultInstallation,
	getInstallations,
	type InstalledSkill,
	type RepoConfig,
	removeInstalledSkill,
	removeRepo,
	type StoredInstallation,
	setDefaultInstallation,
	setDefaultRepo,
	setInstallations,
} from "./store.js";
