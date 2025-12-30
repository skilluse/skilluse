# web09-layout-review - Review and Fix Homepage Layout Issues

## Overview

Refactor the website layout to match OpenCode design style with bordered container, sticky header, and connected card sections.

## Implemented Changes

### Layout Structure
- Added bordered container wrapper around entire page content
- Viewport margin: `p-2 sm:p-4`
- Max width: `max-w-272`
- Outer border: `border border-border`

### Header
- Changed from `fixed` to `sticky top-0` positioning
- Three-column layout: Logo | Navigation | Social Icons
- Removed lightning icon from logo
- Mobile hamburger menu for responsive navigation

### Footer
- Three-column layout: GitHub | Twitter | Copyright
- Column separators with `border-r`
- Responsive wrapping on mobile with `border-b`

### Border Styling
- All borders use `1px` (not 2px)
- Border color: `hsl(0 3% 87%)` in light mode
- Unified `border-border` class throughout

### Visual Elements
- **Feature cards**: Connected with no gaps, no border radius
- **How It Works cards**: Connected with no gaps, no border radius
- **Terminal hero**: No border radius, no shadow
- **Buttons**: `rounded-none`, equal width (`w-44`)
- **Navigation text**: `uppercase tracking-wide`
- **Hover states**: `text-muted-foreground` → `text-foreground`
- **ASCII logo**: `text-foreground` (black text)

## Technical Details

### Files Modified

```
packages/websites/
├── app/
│   ├── globals.css                    # Border color update
│   └── (web)/
│       └── layout.tsx                 # Bordered container wrapper
└── components/
    ├── layout/
    │   ├── header.tsx                 # Sticky header, removed icon
    │   ├── footer.tsx                 # 1px borders
    │   └── logo.tsx                   # Removed lightning icon
    └── home/
        ├── hero.tsx                   # Equal width buttons
        ├── features.tsx               # Connected cards
        ├── how-it-works.tsx           # Connected cards
        ├── terminal-hero.tsx          # No border radius
        └── cta.tsx                    # Equal width buttons
```

### Design Reference

OpenCode implementation:
- `/Users/yuanjiwei/Documents/GitHub/opencode/packages/web/src/components/Header.astro`
- `/Users/yuanjiwei/Documents/GitHub/opencode/packages/web/src/components/Lander.astro`
- `/Users/yuanjiwei/Documents/GitHub/opencode/packages/web/src/styles/custom.css`

### Color Specifications

**Light Mode:**
- Background: `hsl(0 20% 99%)`
- Foreground: `hsl(0 5% 12%)`
- Border: `hsl(0 3% 87%)`

**Dark Mode:**
- Background: `hsl(0 9% 7%)`
- Foreground: `hsl(0 15% 94%)`
- Border: `hsl(0 3% 28%)`

## Acceptance Criteria

See features.json for testable criteria (14 features, all passing).

## Dependencies

- web08-color-scheme (completed)

## Status

**Completed** - All changes implemented and verified.
