import React, { useState } from "react";
import { Box, Text } from "ink";
import { z } from "zod";
import {
  Spinner,
  Select,
  Table,
  ProgressBar,
  StatusMessage,
  TextInput,
} from "../components/index.js";

export const options = z.object({
  component: z
    .enum(["spinner", "select", "table", "progress", "status", "input", "all"])
    .default("all")
    .describe("Component to demo"),
});

interface Props {
  options: z.infer<typeof options>;
}

function SpinnerDemo() {
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>Spinner Component:</Text>
      <Spinner text="Loading..." />
    </Box>
  );
}

function SelectDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const items = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>Select Component:</Text>
      {selected ? (
        <Text>Selected: {selected}</Text>
      ) : (
        <Select items={items} onSelect={(item) => setSelected(item.value)} />
      )}
    </Box>
  );
}

function TableDemo() {
  const data = [
    { name: "skill-1", version: "1.0.0", status: "installed" },
    { name: "skill-2", version: "2.1.0", status: "available" },
    { name: "skill-3", version: "0.5.0", status: "installed" },
  ];

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>Table Component:</Text>
      <Table data={data} columns={["name", "version", "status"]} />
    </Box>
  );
}

function ProgressDemo() {
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>ProgressBar Component:</Text>
      <ProgressBar percent={0} width={20} />
      <ProgressBar percent={50} width={20} />
      <ProgressBar percent={100} width={20} />
    </Box>
  );
}

function StatusDemo() {
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>StatusMessage Component:</Text>
      <StatusMessage type="success">Operation completed</StatusMessage>
      <StatusMessage type="error">Something went wrong</StatusMessage>
      <StatusMessage type="warning">Proceed with caution</StatusMessage>
    </Box>
  );
}

function TextInputDemo() {
  const [value, setValue] = useState("");

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>TextInput Component:</Text>
      <Box>
        <Text>Enter text: </Text>
        <TextInput
          value={value}
          onChange={setValue}
          placeholder="Type something..."
        />
      </Box>
      {value && <Text dimColor>You typed: {value}</Text>}
    </Box>
  );
}

export default function Demo({ options: opts }: Props) {
  const { component } = opts;

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>
        UI Components Demo
      </Text>

      {(component === "all" || component === "spinner") && <SpinnerDemo />}
      {(component === "all" || component === "select") && <SelectDemo />}
      {(component === "all" || component === "table") && <TableDemo />}
      {(component === "all" || component === "progress") && <ProgressDemo />}
      {(component === "all" || component === "status") && <StatusDemo />}
      {(component === "all" || component === "input") && <TextInputDemo />}
    </Box>
  );
}
