import Conf from "conf";
import { configPath } from "./paths.js";

export interface RepoConfig {
  repo: string; // "owner/repo"
  branch: string;
  paths: string[];
}

export interface InstalledSkill {
  name: string;
  repo: string;
  repoPath: string;
  commitSha: string;
  version: string;
  type: string;
  installedPath: string;
  scope: "local" | "global";
}

export interface Config {
  defaultRepo: string | null;
  repos: RepoConfig[];
  installed: InstalledSkill[];
}

const defaultConfig: Config = {
  defaultRepo: null,
  repos: [],
  installed: [],
};

const store = new Conf<Config>({
  projectName: "skilluse",
  cwd: configPath,
  defaults: defaultConfig,
});

export function getConfig(): Config {
  return {
    defaultRepo: store.get("defaultRepo"),
    repos: store.get("repos"),
    installed: store.get("installed"),
  };
}

export function addRepo(repo: RepoConfig): void {
  const repos = store.get("repos");
  const existingIndex = repos.findIndex((r) => r.repo === repo.repo);
  if (existingIndex >= 0) {
    repos[existingIndex] = repo;
  } else {
    repos.push(repo);
  }
  store.set("repos", repos);
}

export function removeRepo(repoName: string): void {
  const repos = store.get("repos");
  const filtered = repos.filter((r) => r.repo !== repoName);
  store.set("repos", filtered);

  if (store.get("defaultRepo") === repoName) {
    store.set("defaultRepo", null);
  }
}

export function setDefaultRepo(repoName: string): void {
  store.set("defaultRepo", repoName);
}

export function addInstalledSkill(skill: InstalledSkill): void {
  const installed = store.get("installed");
  const existingIndex = installed.findIndex((s) => s.name === skill.name);
  if (existingIndex >= 0) {
    installed[existingIndex] = skill;
  } else {
    installed.push(skill);
  }
  store.set("installed", installed);
}

export function removeInstalledSkill(name: string): void {
  const installed = store.get("installed");
  const filtered = installed.filter((s) => s.name !== name);
  store.set("installed", filtered);
}
