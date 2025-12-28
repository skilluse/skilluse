export {
  requestDeviceCode,
  pollForAccessToken,
  pollUntilComplete,
  openBrowser,
  sleep,
  getUserInstallations,
  getInstallationRepositories,
  getInstallationToken,
  type DeviceCodeResponse,
  type AccessTokenResponse,
  type OAuthError,
  type PollResult,
  type Installation,
  type Repository,
  type InstallationToken,
} from "./oauth.js";

export {
  getConfig,
  addRepo,
  removeRepo,
  setDefaultRepo,
  addInstalledSkill,
  removeInstalledSkill,
  setInstallations,
  getInstallations,
  setDefaultInstallation,
  getDefaultInstallation,
  clearInstallations,
  type Config,
  type RepoConfig,
  type InstalledSkill,
  type StoredInstallation,
} from "./store.js";

export {
  configPath,
  dataPath,
  cachePath,
  logPath,
  tempPath,
} from "./paths.js";

export {
  // Legacy (deprecated)
  getCredentials,
  setCredentials,
  clearCredentials,
  isKeychainAvailable,
  type Credentials,
  // New GitHub App credential functions
  setUserCredentials,
  getUserCredentials,
  getCachedInstallationToken,
  setCachedInstallationToken,
  clearInstallationTokenCache,
  clearAllCredentials,
  type UserCredentials,
  type InstallationTokenCache,
} from "./credentials.js";
