# Web08: Black & White Color Scheme Update

## Overview
Update the website color scheme to use a refined black and white palette with warm neutral tones, replacing the current CLI-inspired blue-teal theme.

## Color Palette

### Base Neutrals (Black & White - Main Colors)
| Color | Hex | Usage |
|-------|-----|-------|
| Near Black | `#141414` | Dark mode background, text on light |
| Warm Dark | `#26251E` | Dark mode cards, secondary dark |
| Mid Gray | `#8E8EA0` | Muted text, borders |
| Light Gray 1 | `#E1E0DB` | Light mode borders |
| Light Gray 2 | `#E6E5E0` | Light mode muted backgrounds |
| Light Gray 3 | `#EBEAE5` | Light mode cards |
| Light Gray 4 | `#F0EFEB` | Light mode secondary bg |
| Light Gray 5 | `#F2F1ED` | Light mode background |
| Warm White | `#F7F7F4` | Light mode primary background |

### Accent Colors (Available for use)
| Category | Color | Hex | Suggested Use |
|----------|-------|-----|---------------|
| **Green** | Teal | `#1F8A65` | Primary buttons, links |
| | Bright | `#22C55E` | Success states |
| | Dark Teal | `#34785C` | Hover states |
| **Blue** | Dark | `#206595` | Alternative primary |
| | Medium | `#3C7CAB` | Links on dark |
| | Teal | `#427986` | Secondary actions |
| | Light | `#6087C5` | Highlights |
| **Purple** | Deep | `#6049B3` | Alternative accent |
| | Light | `#9E94D5` | Decorative |
| **Pink/Red** | Magenta | `#AA52A2` | Decorative |
| | Deep Red | `#B3003F` | Destructive |
| | Pink | `#B8448B` | Decorative |
| | Red | `#CF2D56` | Errors, destructive |
| **Orange** | Bright | `#F54E00` | CTA, warnings |
| | Warm | `#DB704B` | Secondary accent |
| | Golden | `#C08532` | Highlights |

## Recommended Theme

### Light Mode
```css
--color-background: #F7F7F4;        /* Warm white */
--color-foreground: #141414;        /* Near black */
--color-card: #EBEAE5;              /* Light gray card */
--color-card-foreground: #141414;
--color-border: #E1E0DB;            /* Light border */
--color-muted: #F0EFEB;             /* Muted bg */
--color-muted-foreground: #8E8EA0;  /* Mid gray text */
--color-primary: #1F8A65;           /* Teal green */
--color-primary-foreground: #F7F7F4;
--color-secondary: #F54E00;         /* Orange accent */
--color-secondary-foreground: #F7F7F4;
--color-destructive: #CF2D56;       /* Red */
```

### Dark Mode
```css
--color-background: #141414;        /* Near black */
--color-foreground: #F2F1ED;        /* Light text */
--color-card: #26251E;              /* Warm dark card */
--color-card-foreground: #F2F1ED;
--color-border: #26251E;            /* Dark border */
--color-muted: #26251E;             /* Muted bg */
--color-muted-foreground: #8E8EA0;  /* Mid gray text */
--color-primary: #22C55E;           /* Bright green (more visible) */
--color-primary-foreground: #141414;
--color-secondary: #F54E00;         /* Orange accent */
--color-secondary-foreground: #141414;
--color-destructive: #CF2D56;       /* Red */
```

## Design Rationale

1. **Black & White Focus**: The warm neutrals (#F7F7F4 to #141414) provide a sophisticated, professional look while avoiding harsh pure white/black.

2. **Green Primary**: Keeping green (#1F8A65 light / #22C55E dark) maintains CLI aesthetic and signals "go/action".

3. **Orange Secondary**: #F54E00 provides high contrast accent for CTAs and important elements.

4. **Warm Tones**: The slight warm undertone in all neutrals creates a more inviting, less sterile feel.

## Implementation

### Files to Update
- `app/globals.css` - Theme variables

### Steps
1. Replace all color variables in `@theme` block
2. Update dark mode colors in `@media (prefers-color-scheme: dark)`
3. Verify contrast ratios meet WCAG AA standards
4. Test all components with new colors

## Accessibility Notes
- Text contrast ratios to verify:
  - #141414 on #F7F7F4 = 16.5:1 (excellent)
  - #8E8EA0 on #F7F7F4 = 3.4:1 (verify for muted text)
  - #1F8A65 on #F7F7F4 = 4.6:1 (passes AA)
  - #F54E00 on #F7F7F4 = 3.5:1 (use for larger text/icons)
