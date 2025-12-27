# Web07: CLI-Style Landing Page

## Overview
Refactor the landing page to use a CLI/terminal aesthetic inspired by [hammad-mohi.github.io](https://hammad-mohi.github.io/). The entire page becomes an interactive terminal experience.

## Reference
Source: `/tmp/cli-portfolio` (cloned from https://github.com/hammad-mohi/hammad-mohi.github.io)

## Design Specifications

### Color Palette (Dark Theme)
```css
--cli-body: #1D2A35;
--cli-primary: #05CE91;      /* Green - commands, prompts */
--cli-secondary: #FF9D00;    /* Orange - links, user */
--cli-text-100: #cbd5e1;     /* Primary text */
--cli-text-200: #B2BDCC;     /* Secondary text */
--cli-text-300: #64748b;     /* Muted text */
--cli-scroll-handle: #19252E;
--cli-scroll-hover: #162028;
```

### Color Palette (Light Theme)
```css
--cli-body: #EFF3F3;
--cli-primary: #027474;      /* Teal - commands, prompts */
--cli-secondary: #FF9D00;    /* Orange - links, user */
--cli-text-100: #334155;     /* Primary text */
--cli-text-200: #475569;     /* Secondary text */
--cli-text-300: #64748b;     /* Muted text */
--cli-scroll-handle: #C1C1C1;
--cli-scroll-hover: #AAAAAA;
```

### Typography
- **Font**: `'IBM Plex Mono', 'Geist Mono', monospace`
- **Font weight**: 500
- **Line height**: 1.5rem

### Terminal Prompt Style
```
visitor@skilluse.dev:~$
```
- `visitor` in secondary color (orange)
- `skilluse.dev` in primary color (green)

### ASCII Art Logo
```
   _____ __   _ ____
  / ___// /__(_) / /_  __________
  \__ \/ //_/ / / / / / / ___/ _ \
 ___/ / ,< / / / / /_/ (__  )  __/
/____/_/|_/_/_/_/\__,_/____/\___/
```

### Page Sections (as CLI commands)

1. **welcome** - Hero section with ASCII logo and intro
2. **help** - List of available commands/sections
3. **about** - About SkillUse CLI tool
4. **features** - Key features list
5. **install** - Installation instructions
6. **agents** - Supported AI agents
7. **repo** - Link to GitHub repository

### Component Structure

```
app/(web)/page.tsx
├── CLITerminal (wrapper)
│   ├── TerminalPrompt
│   ├── WelcomeSection (ASCII art + intro)
│   ├── HelpSection (command list)
│   ├── FeaturesSection (feature list)
│   ├── InstallSection (code blocks)
│   └── CTASection (links)
```

### Styling Patterns

1. **Links**: Dashed underline, solid on hover
   ```css
   border-bottom: 2px dashed var(--cli-secondary);
   &:hover { border-bottom-style: solid; }
   ```

2. **Commands**: Primary color (green)
   ```css
   color: var(--cli-primary);
   ```

3. **Separators**: `----`

4. **Section spacing**: `margin-top: 0.75rem; margin-bottom: 0.75rem;`

5. **Custom scrollbar**:
   - Width: 15px
   - Track: body color
   - Handle: scroll-handle color

## Technical Implementation

### Phase 1: Theme Setup
- Add CLI color variables to globals.css
- Add IBM Plex Mono font
- Create CLI-specific utility classes

### Phase 2: Components
- `CLIWrapper` - Full-screen terminal container
- `TerminalPrompt` - Reusable prompt component
- `CLISection` - Section wrapper with command header
- `CLILink` - Styled link component
- `ASCIILogo` - ASCII art display

### Phase 3: Page Refactor
- Replace current landing page with CLI terminal
- Convert sections to CLI-style output
- Add command-style section headers

### Phase 4: Interactivity (Optional)
- Add typing animation for welcome
- Add command input simulation
- Theme switcher (dark/light/matrix/ubuntu)

## File Changes

### New Files
- `components/web/cli/cli-wrapper.tsx`
- `components/web/cli/terminal-prompt.tsx`
- `components/web/cli/cli-section.tsx`
- `components/web/cli/cli-link.tsx`
- `components/web/cli/ascii-logo.tsx`
- `components/web/cli/index.ts`

### Modified Files
- `app/globals.css` - Add CLI theme variables
- `app/(web)/page.tsx` - Use CLI components
- `app/layout.tsx` - Add IBM Plex Mono font

## Dependencies
- Google Fonts: IBM Plex Mono
- No additional npm packages required

## Acceptance Criteria
See features.json for testable criteria.

## Out of Scope
- Interactive command input (can add later)
- Command history (can add later)
- Multiple theme support (can add later)
