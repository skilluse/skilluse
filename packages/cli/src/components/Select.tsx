import React from "react";
import SelectInput from "ink-select-input";

interface SelectItem {
  label: string;
  value: string;
}

interface SelectProps {
  items: SelectItem[];
  onSelect: (item: SelectItem) => void;
}

export function Select({ items, onSelect }: SelectProps) {
  return <SelectInput items={items} onSelect={onSelect} />;
}
