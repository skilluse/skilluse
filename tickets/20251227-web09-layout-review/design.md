# web09-layout-review - Review and Fix Homepage Layout Issues

## Overview

Review and refactor the website layout to match OpenCode design style. The previous implementation may have introduced layout issues that need to be fixed, including duplicate borders, incorrect padding, and visual inconsistencies.

## Requirements

### Border Issues
- Ensure no duplicate vertical/horizontal border lines between sections
- Header bottom border should be single `2px solid` line
- Footer top border should be single `2px solid` line
- Footer column separators should not create double lines

### Padding/Margin Consistency
- Verify header content is vertically centered
- Ensure container padding is consistent across breakpoints
- Check `pt-(--header-offset)` calculation is correct
- Footer columns should have consistent padding

### Layout Structure
- Header: Three-column layout (Logo | Navigation | Social Icons)
- Footer: Three-column layout (GitHub | Twitter | Copyright)
- Mobile responsive hamburger menu for header
- Footer responsive wrapping on mobile

### Visual Consistency
- Navigation text: `uppercase tracking-wide`
- Border color: unified `border-border`
- Hover states: `text-muted-foreground` → `text-foreground`
- Dark/light mode support

## Technical Details

### Files to Review

```
packages/websites/
├── app/
│   ├── globals.css                    # Color theme configuration
│   └── (web)/
│       └── layout.tsx                 # Page layout structure
└── components/
    ├── layout/
    │   ├── header.tsx                 # Header three-column layout
    │   ├── footer.tsx                 # Footer three-column layout
    │   └── container.tsx              # Container padding
    └── home/
        ├── hero.tsx
        ├── features.tsx
        ├── how-it-works.tsx
        ├── supported-agents.tsx
        └── cta.tsx
```

### Design Reference

OpenCode implementation:
- `/Users/yuanjiwei/Documents/GitHub/opencode/packages/web/src/components/Header.astro`
- `/Users/yuanjiwei/Documents/GitHub/opencode/packages/web/src/components/Lander.astro` (footer: lines 177-187, styles: 634-679)
- `/Users/yuanjiwei/Documents/GitHub/opencode/packages/web/src/styles/custom.css`

### Color Specifications

**Light Mode:**
- Background: `hsl(0 20% 99%)`
- Foreground: `hsl(0 5% 12%)`
- Border: `hsl(30 2% 81%)`

**Dark Mode:**
- Background: `hsl(0 9% 7%)`
- Foreground: `hsl(0 15% 94%)`
- Border: `hsl(0 3% 28%)`

**Accent:**
- Lime green: `hsl(62 84% 88%)`

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- web08-color-scheme (completed)

## Out of Scope

- Content changes (text, images)
- New feature additions
- shadcn UI component modifications (use className overrides instead)
