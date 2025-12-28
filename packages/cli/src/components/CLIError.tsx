import React from "react";
import { Box, Text } from "ink";
import figures from "figures";

export interface CLIErrorProps {
  /** Main error message */
  message: string;
  /** Optional context like the repository name */
  context?: string;
  /** Possible causes for the error */
  causes?: string[];
  /** Suggested command or action */
  suggestion?: string;
  /** Error type: 'error' for failures, 'warning' for non-fatal issues */
  type?: "error" | "warning";
}

/**
 * Structured CLI error message component.
 * Shows actionable error information with possible causes and suggestions.
 *
 * Example output:
 * ✗ Repository 'foo/bar' not found
 *
 *   Possible causes:
 *   • The repository doesn't exist
 *   • You don't have access (try: skilluse login)
 *
 *   Run 'skilluse repo list' to see available repos
 */
export function CLIError({
  message,
  context,
  causes,
  suggestion,
  type = "error",
}: CLIErrorProps) {
  const icon = type === "error" ? figures.cross : figures.warning;
  const color = type === "error" ? "red" : "yellow";

  // Format the main message with optional context
  const displayMessage = context ? `${message} '${context}'` : message;

  return (
    <Box flexDirection="column">
      {/* Main error line */}
      <Box>
        <Text color={color}>{icon} </Text>
        <Text>{displayMessage}</Text>
      </Box>

      {/* Possible causes */}
      {causes && causes.length > 0 && (
        <Box flexDirection="column" marginTop={1} marginLeft={2}>
          <Text dimColor>Possible causes:</Text>
          {causes.map((cause, i) => (
            <Box key={i} marginLeft={0}>
              <Text dimColor>• {cause}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Suggestion */}
      {suggestion && (
        <Box marginTop={1} marginLeft={2}>
          <Text dimColor>{suggestion}</Text>
        </Box>
      )}
    </Box>
  );
}
