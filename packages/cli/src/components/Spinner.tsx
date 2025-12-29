import { Box, Text } from "ink";
import InkSpinner from "ink-spinner";

interface SpinnerProps {
	text?: string;
}

export function Spinner({ text }: SpinnerProps) {
	return (
		<Box>
			<Text color="cyan">
				<InkSpinner type="line" />
			</Text>
			{text && <Text> {text}</Text>}
		</Box>
	);
}
