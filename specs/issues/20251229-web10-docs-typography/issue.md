# Web10: Fix Blog/Docs Markdown Rendering & Typography

## Overview

The Docs and Blog Markdown rendering has poor typography and layout issues. Need to reference OpenAlternative's implementation as the gold standard.

## Problem Statement

1. **Poor Typography** - Markdown content lacks proper styling for headings, links, code blocks, lists
2. **Missing Prose Component** - No wrapper component with Tailwind typography classes
3. **Missing MDX Components** - No custom components for links, images
4. **Scrolling Issues** - Sticky sidebar and TOC may have positioning problems

## Reference Implementation

Study these files in `/Users/yuanjiwei/Documents/GitHub/openalternative/`:

| File | Purpose |
|------|---------|
| `components/common/prose.tsx` | Comprehensive Tailwind typography wrapper |
| `components/web/mdx.tsx` | MDX wrapper combining Prose + MDXContent |
| `components/web/mdx-components.tsx` | Custom link/image components |
| `app/(web)/blog/[slug]/page.tsx` | Clean blog layout structure |

## Implementation Plan

### 1. Create Prose Component

Create `components/common/prose.tsx` based on OpenAlternative:

```tsx
// Key classes to include:
"prose prose-neutral dark:prose-invert"
"prose-headings:scroll-mt-20 prose-headings:text-foreground prose-headings:font-semibold"
"prose-a:text-foreground prose-a:hover:text-primary prose-a:decoration-foreground/30"
"prose-code:bg-foreground/10 prose-code:rounded prose-code:px-[0.33em] prose-code:py-[0.166em]"
"prose-pre:rounded-none prose-pre:font-mono"
"prose-h1:text-3xl md:prose-h1:text-4xl"
"prose-h2:text-2xl md:prose-h2:text-3xl"
// ... etc
```

### 2. Create MDX Wrapper

Create `components/mdx/mdx.tsx`:

```tsx
import { MDXContent } from "@content-collections/mdx/react"
import { Prose } from "~/components/common/prose"
import { MDXComponents } from "./mdx-components"

export const MDX = ({ className, code, components }) => {
  return (
    <Prose className={cx("max-w-3xl", className)}>
      <MDXContent code={code} components={{ ...MDXComponents, ...components }} />
    </Prose>
  )
}
```

### 3. Create MDX Components

Create `components/mdx/mdx-components.tsx`:

```tsx
// Custom <a> - handle internal vs external links
const a = ({ href, ...props }) => {
  if (href?.startsWith("/") || href?.startsWith("#")) {
    return <Link href={href} {...props} />
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {props.children}
      <ExternalLinkIcon />
    </a>
  )
}

// Custom <img> - use Next.js Image
const img = (props) => (
  <Image src={props.src} alt={props.alt} width={1280} height={720} />
)
```

### 4. Update Pages

Update docs and blog pages to use new MDX wrapper instead of raw MDXContent.

### 5. Fix Scrolling

- Verify sticky sidebar works correctly
- Check TOC scroll spy accuracy
- Ensure smooth scroll to anchors with proper header offset

## Files to Create/Modify

| File | Action |
|------|--------|
| `components/common/prose.tsx` | Create |
| `components/mdx/mdx.tsx` | Create |
| `components/mdx/mdx-components.tsx` | Create |
| `app/(web)/docs/[...slug]/page.tsx` | Update |
| `app/(web)/docs/layout.tsx` | Check |
| `app/(web)/blog/[slug]/page.tsx` | Update |
| `app/globals.css` | May need tweaks |
| `package.json` | Verify @tailwindcss/typography |

## Constraints

1. **Keep existing layout** - Don't change overall page structure
2. **Match OpenAlternative quality** - Professional typography
3. **Test both modes** - Light and dark mode support
4. **Mobile responsive** - Works on all screen sizes

## Acceptance Criteria

- [ ] Headings have proper sizes and scroll margins
- [ ] Links have hover states and external link indicators
- [ ] Code blocks have syntax highlighting and proper styling
- [ ] Lists are properly indented and styled
- [ ] Images are optimized with Next.js Image
- [ ] Scrolling and sticky elements work correctly
- [ ] Both light and dark modes look good
