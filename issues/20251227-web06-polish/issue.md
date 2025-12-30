# Web06: Polish & SEO

## Overview
Add final polish including SEO optimization, Open Graph images, sitemap generation, error pages, and mobile responsiveness verification.

## Requirements
- SEO metadata on all pages
- Open Graph images for social sharing
- Sitemap generation
- 404 and error pages
- Mobile responsiveness testing and fixes
- Performance optimization

## Technical Details

### SEO Metadata
Each page should have:
```typescript
export const metadata: Metadata = {
  title: "Page Title | SkillUse",
  description: "Page description for search engines",
  openGraph: {
    title: "Page Title",
    description: "Description for social sharing",
    url: "/page-path",
    images: [{ url: "/og/page.png" }],
  },
  alternates: {
    canonical: "/page-path",
  },
}
```

### Open Graph Images
Options:
1. **Static images** - Pre-designed images in `/public/og/`
2. **Dynamic generation** - Using `next/og` (ImageResponse)

For dynamic OG images:
```typescript
// app/(web)/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og"

export default async function OGImage({ params }) {
  const post = getPostBySlug(params.slug)
  return new ImageResponse(
    <div style={{ ... }}>
      <h1>{post.title}</h1>
    </div>,
    { width: 1200, height: 630 }
  )
}
```

### Sitemap Generation
Using `next-sitemap`:
```typescript
// next-sitemap.config.js
module.exports = {
  siteUrl: "https://skilluse.ai",
  generateRobotsTxt: true,
  exclude: ["/api/*"],
}
```

### Error Pages

**404 Page** (`app/(web)/not-found.tsx`):
- Friendly message
- Link back to home
- Suggested links

**Error Page** (`app/(web)/error.tsx`):
- Error boundary component
- Reset button
- Report issue link

### Performance Checklist
- [ ] Images optimized with next/image
- [ ] Fonts preloaded
- [ ] CSS minified
- [ ] No unused dependencies
- [ ] Lighthouse score > 90

### Mobile Responsiveness Checklist
- [ ] Landing page all sections
- [ ] Header mobile menu
- [ ] Blog listing and detail
- [ ] Docs sidebar drawer
- [ ] Footer layout

## Acceptance Criteria
See features.json for testable criteria.

## Dependencies
- All previous tickets (web01-web05)

## Out of Scope
- Analytics integration (can add separately)
- A/B testing
- Internationalization
