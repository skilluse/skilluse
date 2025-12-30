# Project Setup

## Overview
Initialize the CLI project with TypeScript, React, and Ink framework for terminal UI.

## Requirements
- Initialize npm package with proper configuration
- Configure TypeScript with React JSX support
- Set up Ink + Pastel CLI framework
- Create project structure matching the architecture

## Technical Details

### Project Structure
```
packages/cli/
├── src/
│   ├── index.tsx           # CLI entry point
│   ├── app.tsx             # Ink App root component
│   ├── commands/           # Command handlers
│   ├── components/         # UI components
│   ├── services/           # Business logic
│   ├── config/             # Configuration
│   ├── hooks/              # React hooks
│   └── types/              # Type definitions
├── package.json
└── tsconfig.json
```

### Dependencies
```json
{
  "dependencies": {
    "ink": "^4.x",
    "react": "^18.x",
    "pastel": "^2.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x"
  }
}
```

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- None (first ticket)

## Out of Scope
- UI components (task02)
- GitHub OAuth (task03)
- Any command implementations
