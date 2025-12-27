import React from "react";
import { Box, Text } from "ink";

type Scalar = string | number | boolean | null | undefined;
type ScalarDict = Record<string, Scalar>;

interface TableProps<T extends ScalarDict> {
  data: T[];
  columns?: (keyof T)[];
}

export function Table<T extends ScalarDict>({
  data,
  columns,
}: TableProps<T>) {
  if (data.length === 0) {
    return <Text dimColor>No data</Text>;
  }

  // Get columns from data keys if not specified
  const cols = columns || (Object.keys(data[0]!) as (keyof T)[]);

  // Calculate column widths
  const widths = cols.map((col) => {
    const headerWidth = String(col).length;
    const maxDataWidth = data.reduce((max, row) => {
      const value = row[col];
      const width = value == null ? 0 : String(value).length;
      return Math.max(max, width);
    }, 0);
    return Math.max(headerWidth, maxDataWidth);
  });

  const renderCell = (value: Scalar, width: number, isHeader = false) => {
    const str = value == null ? "" : String(value);
    const padded = str.padEnd(width);
    return isHeader ? (
      <Text bold>{padded}</Text>
    ) : (
      <Text>{padded}</Text>
    );
  };

  const separator = (
    <Box>
      <Text>
        {widths.map((w, i) => "─".repeat(w) + (i < widths.length - 1 ? "─┼─" : "")).join("")}
      </Text>
    </Box>
  );

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        {cols.map((col, i) => (
          <Box key={String(col)}>
            {renderCell(String(col), widths[i]!, true)}
            {i < cols.length - 1 && <Text> │ </Text>}
          </Box>
        ))}
      </Box>
      {separator}
      {/* Rows */}
      {data.map((row, rowIndex) => (
        <Box key={rowIndex}>
          {cols.map((col, i) => (
            <Box key={String(col)}>
              {renderCell(row[col], widths[i]!)}
              {i < cols.length - 1 && <Text> │ </Text>}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
