# Web04: Blog Setup

## Overview
Implement the blog section with content-collections for MDX posts, listing page, and post detail page with proper styling.

## Requirements
- Configure posts collection in content-collections
- Create blog listing page with post cards
- Create blog post detail page with MDX rendering
- Add post metadata (title, date, author, description)
- Implement share buttons

## Technical Details

### Content Collection (`content-collections.ts`)
```typescript
const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.{md,mdx}",
  schema: z => ({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    author: z.object({
      name: z.string(),
      image: z.string(),
      twitterHandle: z.string().optional(),
    }),
  }),
  transform: async (data, context) => {
    const content = await compileMDX(context, data, mdxOptions)
    return { ...data, content }
  },
})
```

### Blog Listing Page (`app/(web)/blog/page.tsx`)
- Title: "SkillUse Blog"
- Description: "Articles about AI agents..."
- Grid of PostCard components
- Sorted by publishedAt descending

### Blog Post Page (`app/(web)/blog/[slug]/page.tsx`)
- Breadcrumbs: Home > Blog > Post Title
- Post title (h1)
- Metadata: date, author, reading time
- MDX content with prose styling
- Share buttons at bottom

### Post Card (`components/posts/post-card.tsx`)
- Optional cover image
- Title
- Description (truncated)
- Published date
- Link to full post

### MDX Components (`components/shared/mdx-components.tsx`)
- Code blocks with syntax highlighting
- Custom headings with anchor links
- Images with optimization
- Callouts/alerts

### Sample Post (`content/posts/getting-started.mdx`)
```mdx
---
title: "Getting Started with SkillUse"
description: "Learn how to install and configure SkillUse CLI"
publishedAt: "2025-12-27"
author:
  name: "SkillUse Team"
  image: "/authors/team.png"
---

## Introduction
...
```

## Acceptance Criteria
See features.json for testable criteria.

## Dependencies
- web01-project-setup (content-collections config)
- web02-core-layout (layout, breadcrumbs)
- web07-cli-landing-page (CLI theme variables and typography)
- web09-layout-review (component structure)

## Component Structure
```
packages/websites/components/
├── home/         # Home page sections
├── layout/       # Header, footer, container, nav
├── shared/       # Utilities: link, icon, prose, mdx
├── ui/           # shadcn components: button, card, dialog
├── posts/        # Blog components (new)
└── docs/         # Docs components (web05)
```

## Theme Integration (OpenCode Style)
The blog pages should follow the OpenCode design style from web09:
- Use bordered container wrapper (already in layout)
- Sticky header at browser top
- All borders use 1px with `border-border` class
- Border color: `hsl(0 3% 87%)` in light mode
- No border radius on cards and buttons (`rounded-none`)
- Post cards should be connected sections (like features/how-it-works)
- IBM Plex Mono font for all text
- Use `text-foreground` for primary text, `text-muted-foreground` for secondary
- Support dark/light modes via CSS media query

## Out of Scope
- RSS feed (web06-polish)
- Search within blog
- Categories/tags
