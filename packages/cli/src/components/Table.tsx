import { Box, Text } from "ink";

type Scalar = string | number | boolean | null | undefined;
type ScalarDict = Record<string, Scalar>;

interface TableProps<T extends ScalarDict> {
	data: T[];
	columns?: (keyof T)[];
	maxColWidth?: number;
}

export function Table<T extends ScalarDict>({
	data,
	columns,
	maxColWidth = 30,
}: TableProps<T>) {
	if (data.length === 0) {
		return <Text dimColor>No data</Text>;
	}

	// Get columns from data keys if not specified
	// biome-ignore lint/style/noNonNullAssertion: data[0] exists since we check data.length above
	const cols = columns || (Object.keys(data[0]!) as (keyof T)[]);

	// Calculate column widths with max limit
	const widths = cols.map((col) => {
		const headerWidth = String(col).length;
		const maxDataWidth = data.reduce((max, row) => {
			const value = row[col];
			const width = value == null ? 0 : String(value).length;
			return Math.max(max, width);
		}, 0);
		return Math.min(Math.max(headerWidth, maxDataWidth), maxColWidth);
	});

	const truncate = (str: string, maxLen: number) => {
		if (str.length <= maxLen) return str;
		return `${str.slice(0, maxLen - 1)}…`;
	};

	const renderCell = (value: Scalar, width: number, isHeader = false) => {
		const str = value == null ? "" : String(value);
		const truncated = truncate(str, width);
		const padded = truncated.padEnd(width);
		return isHeader ? <Text bold>{padded}</Text> : <Text>{padded}</Text>;
	};

	const separator = (
		<Box>
			<Text>
				{widths
					.map((w, i) => "─".repeat(w) + (i < widths.length - 1 ? "─┼─" : ""))
					.join("")}
			</Text>
		</Box>
	);

	return (
		<Box flexDirection="column">
			{/* Header */}
			<Box>
				{cols.map((col, i) => (
					<Box key={String(col)}>
						{/* biome-ignore lint/style/noNonNullAssertion: widths[i] guaranteed by cols */}
						{renderCell(String(col), widths[i]!, true)}
						{i < cols.length - 1 && <Text> │ </Text>}
					</Box>
				))}
			</Box>
			{separator}
			{/* Rows */}
			{data.map((row, rowIndex) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: data rows have no unique ID
				<Box key={rowIndex}>
					{cols.map((col, i) => (
						<Box key={String(col)}>
							{/* biome-ignore lint/style/noNonNullAssertion: widths[i] guaranteed by cols */}
							{renderCell(row[col], widths[i]!)}
							{i < cols.length - 1 && <Text> │ </Text>}
						</Box>
					))}
				</Box>
			))}
		</Box>
	);
}
