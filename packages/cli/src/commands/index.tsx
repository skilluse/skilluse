import React from "react";
import { Box, Text } from "ink";
import { z } from "zod";

export const options = z.object({});

interface Props {
  options: z.infer<typeof options>;
}

export default function Index(_props: Props) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>
        skilluse - AI Coding Agent Skills Manager
      </Text>
      <Text dimColor>
        {"\n"}Use --help to see available commands
      </Text>
    </Box>
  );
}
