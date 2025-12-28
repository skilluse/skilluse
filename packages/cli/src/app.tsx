import { Box, Text } from "ink";

interface AppProps {
	name?: string;
}

export default function App({ name = "skilluse" }: AppProps) {
	return (
		<Box flexDirection="column">
			<Text color="green">{name} - AI Coding Agent Skills Manager</Text>
		</Box>
	);
}
