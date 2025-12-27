# Web07: CLI-Style Landing Page

## Overview
Enhance the landing page with a CLI/terminal aesthetic while maintaining the modern UI design. The approach combines both styles: a terminal hero section within the existing modern layout.

## Reference
Source: `/tmp/cli-portfolio` (cloned from https://github.com/hammad-mohi/hammad-mohi.github.io)

## Design Approach

**Hybrid Design**: Instead of replacing the entire page with a terminal interface, we integrate a CLI-styled terminal hero component within the existing modern landing page structure. This provides:

- Visual appeal of terminal aesthetics
- Familiarity of modern UI for non-technical visitors
- CLI branding that matches the product (a CLI tool)

## Design Specifications

### Color Palette (Dark Theme)
```css
--color-background: hsl(200 26% 16%);     /* #1D2A35 */
--color-primary: hsl(158 95% 41%);         /* #05CE91 - green */
--color-secondary: hsl(36 100% 50%);       /* #FF9D00 - orange */
--color-foreground: hsl(210 20% 80%);      /* Light text */
--color-muted-foreground: hsl(210 15% 60%);
```

### Color Palette (Light Theme)
```css
--color-background: hsl(180 10% 94%);      /* #EFF3F3 */
--color-primary: hsl(174 98% 23%);         /* #027474 - teal */
--color-secondary: hsl(36 100% 50%);       /* #FF9D00 - orange */
--color-foreground: hsl(200 14% 26%);      /* Dark text */
--color-muted-foreground: hsl(200 10% 40%);
```

### Typography
- **Font**: `IBM Plex Mono` from Google Fonts
- **Font weights**: 400, 500, 700
- **Applied globally** for CLI aesthetic throughout the site

### Terminal Prompt Style
```
~ $
```
Simplified prompt without username for cleaner look.

### ASCII Art Logo
```
 ____  _    _ _ _ _   _
/ ___|| | _(_) | | | | |___  ___
\___ \| |/ / | | | | | / __|/ _ \
 ___) |   <| | | | |_| \__ \  __/
|____/|_|\_\_|_|_|\___/|___/\___|
```

## Component Structure

```
app/(web)/page.tsx
├── Hero
│   ├── Intro (title + description)
│   ├── CTA Buttons
│   └── TerminalHero (CLI terminal widget)
│       ├── Terminal header (traffic lights)
│       ├── Welcome command (ASCII logo)
│       ├── Help command (commands list)
│       ├── Demo command (install example)
│       └── Active prompt with cursor
├── Features (existing modern cards)
├── HowItWorks (existing step cards)
├── SupportedAgents (existing badges)
└── CTA (existing gradient section)
```

## Technical Implementation

### Completed

1. **Font Setup** (`app/layout.tsx`)
   - IBM Plex Mono from next/font/google
   - Weights: 400, 500, 700
   - Applied as default monospace font

2. **Theme Colors** (`app/globals.css`)
   - CLI-inspired color palette
   - Dark/light mode via prefers-color-scheme
   - Custom scrollbar styling

3. **TerminalHero Component** (`components/web/home/terminal-hero.tsx`)
   - macOS-style terminal header with traffic lights
   - ASCII logo welcome section
   - Command help listing
   - Install demo with success message
   - Blinking cursor prompt

4. **Hero Integration** (`components/web/home/hero.tsx`)
   - TerminalHero below CTA buttons
   - Preserved modern Intro and Stack components

## File Changes

### New Files
- `components/web/home/terminal-hero.tsx` - CLI terminal widget

### Modified Files
- `app/globals.css` - CLI color scheme + custom scrollbar
- `app/layout.tsx` - IBM Plex Mono font
- `components/web/home/hero.tsx` - Integrated TerminalHero
- `components/web/home/index.ts` - Export TerminalHero

### Removed Files
- `components/web/home/terminal-demo.tsx` - Replaced by TerminalHero

## Dependencies
- Google Fonts: IBM Plex Mono (via next/font)
- No additional npm packages required

## Acceptance Criteria
See features.json for testable criteria.

## Future Enhancements (Out of Scope)
- Interactive command input with keyboard support
- Command history navigation
- Multiple theme support (matrix, ubuntu, etc.)
- Typing animation effects
