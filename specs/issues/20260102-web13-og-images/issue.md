# Add Open Graph Images for Docs and Blog Pages

## Overview

Add dedicated Open Graph (OG) images for docs and blog pages to improve social media sharing previews on Twitter, LinkedIn, and other platforms.

## Background

Currently the project has:
- Default homepage OG image (`app/opengraph-image.tsx`)
- Dynamic blog post OG images (`app/(web)/blog/[slug]/opengraph-image.tsx`)

Missing:
- Docs pages (index and detail pages) - no dedicated OG images
- Blog index page - no dedicated OG image

Reference implementation: [openalternative](https://github.com/openalternative/openalternative) project uses Next.js `next/og` library with a reusable `OgBase` component.

## Requirements

### 1. Add OG Images for Docs Pages

- Create `app/(web)/docs/opengraph-image.tsx` - docs index page OG
- Create `app/(web)/docs/[...slug]/opengraph-image.tsx` - docs detail page OG
- OG images should include: document title, description, SkillUse branding
- Style should match existing blog OG (dark background, terminal aesthetic)

### 2. Add OG Image for Blog Index Page

- Create `app/(web)/blog/opengraph-image.tsx` - blog listing page OG
- Display "Blog" title and description

### 3. Refactor for Reusability (Optional)

- Consider creating a reusable OG base component (similar to openalternative's `OgBase`)
- Unify OG image styles and layout across all pages

## Technical Details

### File Structure

```
packages/websites/app/
├── opengraph-image.tsx                     # Existing - homepage default OG
└── (web)/
    ├── blog/
    │   ├── opengraph-image.tsx             # New - Blog index OG
    │   └── [slug]/
    │       └── opengraph-image.tsx         # Existing - Blog post OG
    └── docs/
        ├── opengraph-image.tsx             # New - Docs index OG
        └── [...slug]/
            └── opengraph-image.tsx         # New - Docs detail OG
```

### Reusable Component (Optional)

```
packages/websites/components/og/
└── og-base.tsx                             # Reusable OG base component
```

### OG Image Specifications

- Size: 1200 x 630 px
- Format: PNG
- Background: Dark (#0a0a0a)
- Primary color: Green (#05CE91)
- Font: System monospace

## Acceptance Criteria

See `feature.json` for testable criteria.

## Out of Scope

- Dynamic Google Fonts loading (using system monospace font)
- Logo/Favicon image embedding (keeping pure text style)
