# UI Components

## Overview
Create reusable Ink UI components for the CLI application.

## Requirements
- Spinner component for loading states
- Select component for user selection
- Table component for data display
- ProgressBar component for progress indication
- StatusMessage component for success/error/warning messages
- TextInput component for user input

## Technical Details

### Component APIs

**Spinner.tsx**
```tsx
<Spinner text="Loading..." />
```

**Select.tsx**
```tsx
<Select
  items={[{ label: 'Option 1', value: '1' }]}
  onSelect={(item) => {}}
/>
```

**Table.tsx**
```tsx
<Table
  data={[{ name: 'skill', version: '1.0' }]}
  columns={['name', 'version']}
/>
```

**ProgressBar.tsx**
```tsx
<ProgressBar percent={60} width={20} />
```

**StatusMessage.tsx**
```tsx
<StatusMessage type="success">Operation completed</StatusMessage>
<StatusMessage type="error">Something went wrong</StatusMessage>
<StatusMessage type="warning">Proceed with caution</StatusMessage>
```

**TextInput.tsx**
```tsx
<TextInput
  value={value}
  onChange={setValue}
  placeholder="Enter text..."
/>
```

### Dependencies
- ink-spinner
- ink-select-input
- ink-table
- ink-text-input
- figures (for status icons)

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task01-project-setup

## Out of Scope
- Complex composed components
- Animation beyond spinner
