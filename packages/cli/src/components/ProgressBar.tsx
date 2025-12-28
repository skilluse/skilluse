import { Box, Text } from "ink";

interface ProgressBarProps {
	percent: number;
	width?: number;
}

export function ProgressBar({ percent, width = 20 }: ProgressBarProps) {
	const clampedPercent = Math.max(0, Math.min(100, percent));
	const filled = Math.round((clampedPercent / 100) * width);
	const empty = width - filled;

	return (
		<Box>
			<Text color="green">{"█".repeat(filled)}</Text>
			<Text color="gray">{"░".repeat(empty)}</Text>
			<Text> {clampedPercent}%</Text>
		</Box>
	);
}
