/**
 * Platform-native paths for configuration, data, and cache storage.
 *
 * Uses env-paths to provide appropriate directories per platform:
 * - macOS: ~/Library/Application Support/skilluse/, ~/Library/Caches/skilluse/
 * - Linux: ~/.config/skilluse/, ~/.local/share/skilluse/, ~/.cache/skilluse/
 * - Windows: %APPDATA%/skilluse/, %LOCALAPPDATA%/skilluse/
 */

import envPaths from "env-paths";

const paths = envPaths("skilluse", { suffix: "" });

/** Directory for user configuration (settings, preferences) */
export const configPath = paths.config;

/** Directory for application data (installed skills, repos) */
export const dataPath = paths.data;

/** Directory for cached data (temporary files) */
export const cachePath = paths.cache;

/** Directory for log files */
export const logPath = paths.log;

/** Directory for temporary files */
export const tempPath = paths.temp;
