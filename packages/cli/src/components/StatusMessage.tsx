import figures from "figures";
import { Box, Text } from "ink";
import type React from "react";

type StatusType = "success" | "error" | "warning";

interface StatusMessageProps {
	type: StatusType;
	children: React.ReactNode;
}

const statusConfig: Record<StatusType, { icon: string; color: string }> = {
	success: { icon: figures.tick, color: "green" },
	error: { icon: figures.cross, color: "red" },
	warning: { icon: figures.warning, color: "yellow" },
};

export function StatusMessage({ type, children }: StatusMessageProps) {
	const { icon, color } = statusConfig[type];

	return (
		<Box>
			<Text color={color}>{icon} </Text>
			<Text>{children}</Text>
		</Box>
	);
}
