import { Box, Static, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Spinner, StatusMessage } from "../components/index.js";
import {
	fetchSkillsFromRepo,
	getConfig,
	getCredentials,
	type RepoConfig,
	type SkillMetadata,
} from "../services/index.js";

export const args = z.tuple([z.string().describe("Search keyword")]);

export const options = z.object({
	all: z
		.boolean()
		.default(false)
		.describe("Search in all configured repos (not just default)"),
});

interface Props {
	args: z.infer<typeof args>;
	options: z.infer<typeof options>;
}

type SearchState =
	| { phase: "checking" }
	| { phase: "no_repos" }
	| { phase: "searching"; repo: string }
	| { phase: "success"; skills: SkillMetadata[]; keyword: string }
	| { phase: "auth_required"; message: string }
	| { phase: "error"; message: string };

/**
 * Filter skills by search keyword
 */
function filterSkills(
	skills: SkillMetadata[],
	keyword: string,
): SkillMetadata[] {
	const lowerKeyword = keyword.toLowerCase();

	return skills.filter((skill) => {
		// Match name
		if (skill.name.toLowerCase().includes(lowerKeyword)) {
			return true;
		}

		// Match description
		if (skill.description.toLowerCase().includes(lowerKeyword)) {
			return true;
		}

		// Match tags
		if (skill.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword))) {
			return true;
		}

		return false;
	});
}

export default function Search({ args: [keyword], options: opts }: Props) {
	const { exit } = useApp();
	const [state, setState] = useState<SearchState>({ phase: "checking" });
	const [outputItems, setOutputItems] = useState<Array<{ id: string }>>([]);

	useEffect(() => {
		async function search() {
			const config = getConfig();

			// Determine which repos to search
			let reposToSearch: RepoConfig[] = [];

			if (opts.all) {
				reposToSearch = config.repos;
			} else if (config.defaultRepo) {
				const defaultRepoConfig = config.repos.find(
					(r) => r.repo === config.defaultRepo,
				);
				if (defaultRepoConfig) {
					reposToSearch = [defaultRepoConfig];
				}
			} else if (config.repos.length > 0) {
				// Use first repo if no default
				reposToSearch = [config.repos[0]];
			}

			if (reposToSearch.length === 0) {
				setState({ phase: "no_repos" });
				return;
			}

			// Get optional credentials
			const credentials = await getCredentials();
			const token = credentials?.token;

			// Fetch skills from all repos
			const allSkills: SkillMetadata[] = [];

			for (const repoConfig of reposToSearch) {
				setState({ phase: "searching", repo: repoConfig.repo });

				const result = await fetchSkillsFromRepo(token, repoConfig);

				if ("authRequired" in result) {
					setState({ phase: "auth_required", message: result.message });
					return;
				}

				allSkills.push(...result);
			}

			// Filter by keyword
			const matchingSkills = filterSkills(allSkills, keyword);

			setState({ phase: "success", skills: matchingSkills, keyword });
		}

		search().catch((err) => {
			setState({
				phase: "error",
				message: err instanceof Error ? err.message : "Search failed",
			});
		});
	}, [keyword, opts.all]);

	// Add output item when state is final
	useEffect(() => {
		const isFinalState =
			state.phase === "no_repos" ||
			state.phase === "success" ||
			state.phase === "auth_required" ||
			state.phase === "error";

		if (isFinalState && outputItems.length === 0) {
			setOutputItems([{ id: "output" }]);
		}
	}, [state.phase, outputItems.length]);

	// Exit after output item is rendered
	useEffect(() => {
		if (outputItems.length > 0) {
			process.nextTick(() => exit());
		}
	}, [outputItems.length, exit]);

	const renderContent = () => {
		switch (state.phase) {
			case "auth_required":
				return (
					<Box flexDirection="column">
						<StatusMessage type="error">{state.message}</StatusMessage>
					</Box>
				);

			case "no_repos":
				return (
					<Box flexDirection="column">
						<StatusMessage type="warning">
							No repositories configured
						</StatusMessage>
						<Text dimColor>
							Run 'skilluse repo add owner/repo' to add a skill repository.
						</Text>
					</Box>
				);

			case "success":
				if (state.skills.length === 0) {
					return (
						<Box flexDirection="column">
							<Box marginBottom={1}>
								<Text>Search results for "</Text>
								<Text color="cyan">{state.keyword}</Text>
								<Text>"</Text>
							</Box>
							<StatusMessage type="warning">No skills found</StatusMessage>
							<Box marginTop={1}>
								<Text dimColor>
									Try a different search term or check your configured repos with
									'skilluse repo list'.
								</Text>
							</Box>
						</Box>
					);
				}

				return (
					<Box flexDirection="column">
						<Box marginBottom={1}>
							<Text>Search results for "</Text>
							<Text color="cyan">{state.keyword}</Text>
							<Text>"</Text>
						</Box>

						{state.skills.map((skill) => (
							<Box
								key={`${skill.repo}/${skill.path}`}
								flexDirection="column"
								marginBottom={1}
							>
								<Box>
									<Text color="cyan" bold>
										{skill.name}
									</Text>
									{skill.version && <Text dimColor> v{skill.version}</Text>}
								</Box>
								<Box marginLeft={2}>
									<Text>{skill.description}</Text>
								</Box>
								<Box marginLeft={2}>
									<Text dimColor>
										{skill.repo}
										{skill.type && ` • ${skill.type}`}
									</Text>
								</Box>
							</Box>
						))}

						<Box marginTop={1}>
							<Text dimColor>
								{state.skills.length} skill{state.skills.length !== 1 ? "s" : ""}{" "}
								found
							</Text>
						</Box>
					</Box>
				);

			case "error":
				return <StatusMessage type="error">{state.message}</StatusMessage>;

			default:
				return null;
		}
	};

	return (
		<>
			{(state.phase === "checking" || state.phase === "searching") && (
				<Spinner
					text={
						state.phase === "searching"
							? `Searching ${state.repo}...`
							: "Initializing..."
					}
				/>
			)}
			<Static items={outputItems}>
				{(item) => (
					<Box key={item.id} flexDirection="column">
						{renderContent()}
					</Box>
				)}
			</Static>
		</>
	);
}
