# Docs Typography & UI Refactor

## Overview

Refactor the Docs pages to align with the Blog typography and UI improvements made in web11-blog-typography.

## Background

The Blog pages have been enhanced with improved typography, MDX components, and styling (web11-blog-typography). The Docs pages should receive the same treatment for consistency across the site.

## Completed Fixes (2024-12-30)

The following issues have been addressed in this session:

### 1. Code Block Background Color
- **Problem**: Code blocks had grey background from shiki/rehype-pretty-code theme
- **Solution**: Added comprehensive CSS overrides in `globals.css` to force white background
- **Files**: `app/globals.css` (lines 299-326)

### 2. Mermaid Diagram Rendering
- **Problem**: Mermaid diagrams were messy with overlapping text due to global monospace font
- **Solution**: Reset Mermaid elements to use sans-serif font family
- **Files**: `app/globals.css` (lines 374-384)

### 3. Font Colors Too Light
- **Problem**: Website font colors were too light, especially muted text
- **Solution**: Darkened color values:
  - `foreground`: oklch(0.145 0 0) → oklch(0.12 0 0)
  - `muted-foreground`: oklch(0.556 0 0) → oklch(0.45 0 0)
- **Files**: `app/globals.css`

### 4. Header Navigation Colors
- **Problem**: Header links (blog, docs, GitHub) were too light
- **Solution**: Changed from `text-muted-foreground` to `text-foreground/70`
- **Files**: `components/layout/header.tsx`

### 5. Share Buttons Layout
- **Problem**: Share buttons had unnecessary border container
- **Solution**: Removed border, changed to single-line flex layout
- **Files**: `components/posts/share-buttons.tsx`

## Completed (2024-12-31)

### 6. Removed Duplicate H1 Titles
- **Problem**: Docs MDX files had `# Title` which duplicated the page header
- **Solution**: Removed h1 from all docs MDX files (title rendered in page header)
- **Files**: All files in `content/docs/**/*.mdx`

## Remaining Requirements

### 1. Typography Consistency

Docs now uses the same `<MDX />` component as Blog. All styles are shared:
- [x] Code blocks with white background and monospace font
- [x] Heading hierarchy (h1-h6) with proper sizing and spacing (via `mdx-components.tsx`)
- [x] Link styles with hover animations (via `mdx-components.tsx` and `prose.tsx`)
- [x] List styling (ul/ol) with muted markers (via `mdx-components.tsx`)
- [x] Inline code styling (via `mdx-components.tsx`)
- [x] Blockquote styling (via `mdx-components.tsx`)
- [x] Table styling with borders (via `mdx-components.tsx`)

### 2. Layout Improvements

- [x] Review docs layout spacing and padding
- [x] Ensure consistent container width with Blog (uses `max-w-none`)
- [x] Check sidebar and TOC alignment
- [x] Verify mobile responsiveness (sidebar hidden < md, TOC hidden < xl)

### 3. Markdown Rendering

- [x] Mermaid diagrams render correctly
- [x] Verify code syntax highlighting works (rehype-pretty-code)
- [x] Test tables, lists, and other GFM features
- [x] Check heading anchor links (via `globals.css`)

## Technical Details

### Reference Implementation (Blog)

**IMPORTANT**: When implementing this feature, refer to the Blog implementation as the reference:

| Blog File | Purpose |
|-----------|---------|
| `app/(web)/blog/page.tsx` | Blog listing layout |
| `app/(web)/blog/[slug]/page.tsx` | Blog detail page structure |
| `components/mdx/mdx.tsx` | MDX wrapper with Prose |
| `components/mdx/mdx-components.tsx` | Custom MDX element renderers |
| `components/shared/prose.tsx` | Typography styles |
| `app/globals.css` | Code block and anchor link CSS |

### Files to Review/Modify

1. **`packages/websites/app/(web)/docs/layout.tsx`**
   - Review layout structure and spacing
   - Compare with blog layout for consistency

2. **`packages/websites/app/(web)/docs/[...slug]/page.tsx`**
   - Check MDX rendering setup
   - Ensure using same `<MDX />` component as Blog

3. **`packages/websites/components/docs/docs-sidebar.tsx`**
   - Review sidebar styling

4. **`packages/websites/components/docs/docs-toc.tsx`**
   - Review TOC styling

### Shared Components (Already Updated)

These components are shared with Blog and already updated:
- `components/mdx/mdx.tsx` - MDX wrapper
- `components/mdx/mdx-components.tsx` - All HTML element renderers (h1-h6, p, ul, ol, pre, code, table, etc.)
- `components/shared/prose.tsx` - Tailwind typography classes
- `app/globals.css` - Code block font and background overrides, Mermaid font reset

## Acceptance Criteria

See `features.json` for testable criteria.

## Dependencies

- web11-blog-typography (completed)

## Out of Scope

- New docs content
- Search functionality
- Versioning
