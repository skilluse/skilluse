import { Box, Text, useInput } from "ink";
import { useState } from "react";

export interface MultiSelectItem {
	label: string;
	value: string;
	hint?: string;
}

interface MultiSelectProps {
	items: MultiSelectItem[];
	onSubmit: (selectedValues: string[]) => void;
	onCancel?: () => void;
	initialSelected?: string[];
}

export function MultiSelect({
	items,
	onSubmit,
	onCancel,
	initialSelected = [],
}: MultiSelectProps) {
	const [cursor, setCursor] = useState(0);
	const [selected, setSelected] = useState<Set<string>>(
		new Set(initialSelected),
	);

	useInput((input, key) => {
		// Navigation
		if (key.upArrow) {
			setCursor((prev) => (prev > 0 ? prev - 1 : items.length - 1));
			return;
		}

		if (key.downArrow) {
			setCursor((prev) => (prev < items.length - 1 ? prev + 1 : 0));
			return;
		}

		// Toggle selection with space
		if (input === " ") {
			const currentValue = items[cursor].value;
			setSelected((prev) => {
				const next = new Set(prev);
				if (next.has(currentValue)) {
					next.delete(currentValue);
				} else {
					next.add(currentValue);
				}
				return next;
			});
			return;
		}

		// Select/deselect all with 'a'
		if (input === "a") {
			if (selected.size === items.length) {
				// All selected, deselect all
				setSelected(new Set());
			} else {
				// Select all
				setSelected(new Set(items.map((item) => item.value)));
			}
			return;
		}

		// Confirm with Enter
		if (key.return) {
			onSubmit(Array.from(selected));
			return;
		}

		// Cancel with Escape
		if (key.escape && onCancel) {
			onCancel();
		}
	});

	return (
		<Box flexDirection="column">
			{items.map((item, index) => {
				const isSelected = selected.has(item.value);
				const isCursor = index === cursor;

				return (
					<Box key={item.value}>
						<Text color={isCursor ? "cyan" : undefined}>
							{isCursor ? ">" : " "}{" "}
						</Text>
						<Text color={isSelected ? "green" : "gray"}>
							{isSelected ? "[x]" : "[ ]"}{" "}
						</Text>
						<Text color={isCursor ? "cyan" : undefined}>{item.label}</Text>
						{item.hint && (
							<Text dimColor> ({item.hint})</Text>
						)}
					</Box>
				);
			})}
			<Box marginTop={1}>
				<Text dimColor>
					Space: toggle | a: select all | Enter: confirm | Esc: cancel
				</Text>
			</Box>
		</Box>
	);
}
