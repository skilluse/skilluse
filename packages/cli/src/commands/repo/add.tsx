import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
	MultiSelect,
	type MultiSelectItem,
	Select,
	Spinner,
	StatusMessage,
} from "../../components/index.js";
import {
	addRepo,
	discoverSkillPaths,
	type DiscoveryResult,
	getConfig,
	getCredentials,
	parseGitHubRepo,
	setDefaultRepo,
} from "../../services/index.js";

export const args = z.tuple([
	z.string().describe("Repository (owner/repo or https://github.com/owner/repo)"),
]);

export const options = z.object({
	path: z
		.string()
		.optional()
		.describe("Skill path within the repo (e.g., skills/)"),
	branch: z.string().default("main").describe("Branch to use"),
	default: z.boolean().default(false).describe("Set as default repo"),
});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type AddState =
	| { phase: "checking" }
	| { phase: "invalid_repo" }
	| { phase: "already_exists"; repo: string }
	| { phase: "discovering"; repo: string }
	| {
			phase: "select_paths";
			repo: string;
			discovery: DiscoveryResult;
	  }
	| { phase: "no_skills_found"; repo: string }
	| { phase: "input_path"; repo: string; currentPath: string }
	| { phase: "saving"; repo: string }
	| { phase: "success"; repo: string; paths: string[]; isDefault: boolean }
	| { phase: "auth_required"; message: string }
	| { phase: "error"; message: string };

export default function RepoAdd({ args: [repoArg], options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<AddState>({ phase: "checking" });

	// Parse repo identifier once (supports owner/repo and https://github.com/owner/repo)
	const parsed = useMemo(() => parseGitHubRepo(repoArg), [repoArg]);
	const repoIdentifier = parsed ? `${parsed.owner}/${parsed.repo}` : null;

	// Handle exit after terminal states are rendered
	useEffect(() => {
		if (
			state.phase === "invalid_repo" ||
			state.phase === "already_exists" ||
			state.phase === "auth_required" ||
			state.phase === "error" ||
			state.phase === "success"
		) {
			exit();
		}
	}, [state.phase, exit]);

	useEffect(() => {
		async function checkAndAdd() {
			// Validate repo format
			if (!parsed || !repoIdentifier) {
				setState({ phase: "invalid_repo" });
				return;
			}

			// Check if already exists
			const config = getConfig();
			if (config.repos.find((r) => r.repo === repoIdentifier)) {
				setState({ phase: "already_exists", repo: repoIdentifier });
				return;
			}

			// If path is provided via --path, save directly (no API call needed)
			if (opts.path !== undefined) {
				setState({ phase: "saving", repo: repoIdentifier });

				const paths = opts.path ? [opts.path] : [];
				addRepo({
					repo: repoIdentifier,
					branch: opts.branch,
					paths,
				});

				// Set as default if requested or if first repo
				const isDefault = opts.default || config.repos.length === 0;
				if (isDefault) {
					setDefaultRepo(repoIdentifier);
				}

				setState({
					phase: "success",
					repo: repoIdentifier,
					paths: paths.length > 0 ? paths : ["(all paths)"],
					isDefault,
				});
				return;
			}

			// Start discovery with optional credentials
			setState({ phase: "discovering", repo: repoIdentifier });

			try {
				const credentials = await getCredentials();
				const token = credentials?.token;

				const result = await discoverSkillPaths(
					parsed.owner,
					parsed.repo,
					opts.branch,
					token,
				);

				if ("authRequired" in result) {
					setState({ phase: "auth_required", message: result.message });
					return;
				}

				if (result.totalSkills === 0) {
					setState({ phase: "no_skills_found", repo: repoIdentifier });
				} else {
					setState({
						phase: "select_paths",
						repo: repoIdentifier,
						discovery: result,
					});
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				setState({ phase: "error", message });
			}
		}

		checkAndAdd();
	}, [parsed, repoIdentifier, opts.path, opts.branch, opts.default]);

	// Handle path selection submission
	const handlePathsSelected = (selectedPaths: string[]) => {
		if (!repoIdentifier) return;
		const config = getConfig();

		addRepo({
			repo: repoIdentifier,
			branch: opts.branch,
			paths: selectedPaths,
		});

		const isDefault = opts.default || config.repos.length === 0;
		if (isDefault) {
			setDefaultRepo(repoIdentifier);
		}

		setState({
			phase: "success",
			repo: repoIdentifier,
			paths: selectedPaths.length > 0 ? selectedPaths : ["(all paths)"],
			isDefault,
		});
	};

	// Handle no skills found options
	const handleNoSkillsOption = (option: { value: string }) => {
		if (!repoIdentifier) return;
		const config = getConfig();

		switch (option.value) {
			case "manual":
				setState({ phase: "input_path", repo: repoIdentifier, currentPath: "" });
				break;
			case "add_all": {
				addRepo({
					repo: repoIdentifier,
					branch: opts.branch,
					paths: [],
				});

				const isDefault = opts.default || config.repos.length === 0;
				if (isDefault) {
					setDefaultRepo(repoIdentifier);
				}

				setState({
					phase: "success",
					repo: repoIdentifier,
					paths: ["(all paths)"],
					isDefault,
				});
				break;
			}
			case "cancel":
				exit();
				break;
		}
	};

	// Handle input for manual path entry
	useInput(
		(input, key) => {
			if (state.phase !== "input_path" || !repoIdentifier) return;

			if (key.return) {
				// Save with current path
				const config = getConfig();
				const paths = state.currentPath ? [state.currentPath] : [];

				addRepo({
					repo: repoIdentifier,
					branch: opts.branch,
					paths,
				});

				const isDefault = opts.default || config.repos.length === 0;
				if (isDefault) {
					setDefaultRepo(repoIdentifier);
				}

				setState({
					phase: "success",
					repo: repoIdentifier,
					paths: paths.length > 0 ? paths : ["(all paths)"],
					isDefault,
				});
				return;
			}

			if (key.backspace || key.delete) {
				setState({
					...state,
					currentPath: state.currentPath.slice(0, -1),
				});
				return;
			}

			if (key.escape) {
				exit();
				return;
			}

			// Add character
			if (input && !key.ctrl && !key.meta) {
				setState({
					...state,
					currentPath: state.currentPath + input,
				});
			}
		},
		{ isActive: state.phase === "input_path" },
	);

	switch (state.phase) {
		case "checking":
			return <Spinner text="Checking..." />;

		case "auth_required":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">{state.message}</StatusMessage>
					<Box marginTop={1} flexDirection="column">
						<Text dimColor>To access private repositories:</Text>
						<Text dimColor> 1. Run: skilluse login</Text>
						<Text dimColor> 2. Then retry: skilluse repo add {repoArg}</Text>
					</Box>
					<Box marginTop={1}>
						<Text dimColor>
							Or add without verification: skilluse repo add {repoArg} --path
							skills/
						</Text>
					</Box>
				</Box>
			);

		case "invalid_repo":
			return (
				<Box flexDirection="column">
					<StatusMessage type="error">Invalid repository format</StatusMessage>
					<Text dimColor>Accepted formats:</Text>
					<Text dimColor> - owner/repo</Text>
					<Text dimColor> - https://github.com/owner/repo</Text>
				</Box>
			);

		case "already_exists":
			return (
				<Box flexDirection="column">
					<StatusMessage type="info">
						Repository {state.repo} is already configured
					</StatusMessage>
					<Text dimColor>To set it as default skills registry:</Text>
					<Text dimColor> skilluse repo use {state.repo}</Text>
				</Box>
			);

		case "discovering":
			return <Spinner text={`Scanning ${state.repo} for skills...`} />;

		case "select_paths": {
			const items: MultiSelectItem[] = state.discovery.skillPaths.map((sp) => ({
				label: sp.path,
				value: sp.path,
				hint: `${sp.skillCount} skill${sp.skillCount !== 1 ? "s" : ""}`,
			}));

			return (
				<Box flexDirection="column">
					<Text>
						Found <Text color="green">{state.discovery.totalSkills}</Text> skill
						{state.discovery.totalSkills !== 1 ? "s" : ""} in{" "}
						<Text color="cyan">{state.repo}</Text>
					</Text>
					{state.discovery.truncated && (
						<Text color="yellow">
							Warning: Repository is large, some files may not be shown
						</Text>
					)}
					<Box marginTop={1}>
						<Text>Select skill paths to include:</Text>
					</Box>
					<Box marginTop={1}>
						<MultiSelect
							items={items}
							onSubmit={handlePathsSelected}
							onCancel={() => exit()}
							initialSelected={items.map((i) => i.value)}
						/>
					</Box>
				</Box>
			);
		}

		case "no_skills_found":
			return (
				<Box flexDirection="column">
					<StatusMessage type="warning">
						No SKILL.md files found in {state.repo}
					</StatusMessage>
					<Box marginTop={1}>
						<Text>What would you like to do?</Text>
					</Box>
					<Box marginTop={1}>
						<Select
							items={[
								{ label: "Enter path manually", value: "manual" },
								{ label: "Add repo anyway (all paths)", value: "add_all" },
								{ label: "Cancel", value: "cancel" },
							]}
							onSelect={handleNoSkillsOption}
						/>
					</Box>
				</Box>
			);

		case "input_path":
			return (
				<Box flexDirection="column">
					<Text>
						Adding repository: <Text color="cyan">{state.repo}</Text>
					</Text>
					<Box marginTop={1}>
						<Text>Skill path (leave empty for all): </Text>
						<Text color="green">{state.currentPath}</Text>
						<Text color="gray">|</Text>
					</Box>
					<Box marginTop={1}>
						<Text dimColor>Press Enter to confirm, Esc to cancel</Text>
					</Box>
				</Box>
			);

		case "saving":
			return <Spinner text={`Adding ${state.repo}...`} />;

		case "success":
			return (
				<Box flexDirection="column">
					<StatusMessage type="success">Added {state.repo}</StatusMessage>
					{state.paths.map((path) => (
						<Text key={path} dimColor>
							Path: {path}
						</Text>
					))}
					{state.isDefault && <Text dimColor>Set as default repository</Text>}
				</Box>
			);

		case "error":
			return <StatusMessage type="error">{state.message}</StatusMessage>;
	}
}
