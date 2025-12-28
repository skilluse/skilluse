#!/usr/bin/env bun
/**
 * Static CLI entry point for compiled binaries.
 * This file imports all commands statically to work with Bun's single-file compilation.
 *
 * For development, use src/index.tsx which uses Pastel's dynamic command discovery.
 */
import { Command } from "commander";
import React from "react";
import { render } from "ink";

// Import all commands statically
import Demo, { options as demoOptions } from "./commands/demo.js";
import Login, { options as loginOptions } from "./commands/login.js";
import Logout from "./commands/logout.js";
import Whoami from "./commands/whoami.js";
import Repos from "./commands/repos.js";
import Skills from "./commands/skills.js";
import List, { options as listOptions } from "./commands/list.js";
import Search, { args as searchArgs, options as searchOptions } from "./commands/search.js";

// Import repo subcommands
import RepoIndex from "./commands/repo/index.js";
import RepoList from "./commands/repo/list.js";
import RepoAdd, { args as repoAddArgs, options as repoAddOptions } from "./commands/repo/add.js";
import RepoRemove, { args as repoRemoveArgs, options as repoRemoveOptions } from "./commands/repo/remove.js";
import RepoEdit, { args as repoEditArgs, options as repoEditOptions } from "./commands/repo/edit.js";
import RepoSync, { args as repoSyncArgs, options as repoSyncOptions } from "./commands/repo/sync.js";
import RepoUse, { args as repoUseArgs } from "./commands/repo/use.js";

// Version injected via --define at build time, fallback to package.json
const VERSION = process.env.VERSION || "0.1.0";
const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();

const program = new Command();

program
  .name("skilluse")
  .description("CLI tool for managing and installing AI Coding Agent Skills")
  .version(VERSION, "-v, --version", "Show version number")
  .option("--version-verbose", "Show version with build info")
  .on("option:version-verbose", () => {
    console.log(`skilluse ${VERSION}`);
    console.log(`Built: ${BUILD_TIME}`);
    process.exit(0);
  });

// demo command
program
  .command("demo")
  .description("Demo UI components")
  .option("-a, --all", "Show all components")
  .action((opts) => {
    const options = demoOptions.parse(opts);
    render(<Demo options={options} />);
  });

// login command
program
  .command("login")
  .description("Authenticate with GitHub")
  .option("-f, --force", "Force re-authentication")
  .action((opts) => {
    const options = loginOptions.parse(opts);
    render(<Login options={options} />);
  });

// logout command
program
  .command("logout")
  .description("Clear stored credentials")
  .action(() => {
    render(<Logout options={{}} />);
  });

// whoami command
program
  .command("whoami")
  .description("Show current user info")
  .action(() => {
    render(<Whoami options={{}} />);
  });

// repos command
program
  .command("repos")
  .description("List accessible GitHub repositories")
  .action(() => {
    render(<Repos options={{}} />);
  });

// skills command
program
  .command("skills")
  .description("List installed skills")
  .action(() => {
    render(<Skills options={{}} />);
  });

// list command
program
  .command("list")
  .description("List skills from a repository")
  .option("-r, --repo <repo>", "Repository to list skills from")
  .action((opts) => {
    const options = listOptions.parse(opts);
    render(<List options={options} />);
  });

// search command
program
  .command("search <keyword>")
  .description("Search for skills")
  .option("-a, --all", "Search in all configured repos")
  .action((keyword, opts) => {
    const args = searchArgs.parse([keyword]);
    const options = searchOptions.parse(opts);
    render(<Search args={args} options={options} />);
  });

// repo command group
const repoCmd = program
  .command("repo")
  .description("Manage skill repositories");

repoCmd
  .command("list")
  .description("List configured repositories")
  .action(() => {
    render(<RepoList options={{}} />);
  });

repoCmd
  .command("add <url>")
  .description("Add a skill repository")
  .option("-p, --path <path>", "Skill path within the repo")
  .option("-b, --branch <branch>", "Branch to use")
  .option("-d, --default", "Set as default repository")
  .action((url, opts) => {
    const args = repoAddArgs.parse([url]);
    const options = repoAddOptions.parse(opts);
    render(<RepoAdd args={args} options={options} />);
  });

repoCmd
  .command("remove <name>")
  .description("Remove a repository")
  .option("-f, --force", "Skip confirmation")
  .action((name, opts) => {
    const args = repoRemoveArgs.parse([name]);
    const options = repoRemoveOptions.parse(opts);
    render(<RepoRemove args={args} options={options} />);
  });

repoCmd
  .command("edit <name>")
  .description("Edit repository settings")
  .option("-p, --path <path>", "New skill path")
  .option("-b, --branch <branch>", "New branch")
  .action((name, opts) => {
    const args = repoEditArgs.parse([name]);
    const options = repoEditOptions.parse(opts);
    render(<RepoEdit args={args} options={options} />);
  });

repoCmd
  .command("sync [name]")
  .description("Sync repository metadata")
  .action((name, _opts) => {
    const args = repoSyncArgs.parse([name || undefined]);
    const options = repoSyncOptions.parse({});
    render(<RepoSync args={args} options={options} />);
  });

repoCmd
  .command("use <name>")
  .description("Set default repository")
  .action((name, _opts) => {
    const args = repoUseArgs.parse([name]);
    render(<RepoUse args={args} options={{}} />);
  });

// Default action shows help when just 'repo' is called
repoCmd.action(() => {
  render(<RepoIndex options={{}} />);
});

program.parse();
