# Web05: Documentation Setup

## Overview
Implement the documentation section with sidebar navigation, table of contents, MDX content pages, and prev/next pagination.

## Requirements
- Configure docs collection in content-collections
- Create docs layout with sidebar navigation
- Create docs pages with [...slug] routing
- Build table of contents from headings
- Implement prev/next pagination
- Write initial documentation content

## Technical Details

### Content Collection (`content-collections.ts`)
```typescript
const docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: "**/*.{md,mdx}",
  schema: z => ({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional().default(999),
  }),
  transform: async (data, context) => {
    const content = await compileMDX(context, data, mdxOptions)
    const headings = extractHeadings(data.content)
    return { ...data, content, headings }
  },
})
```

### Navigation Configuration (`config/navigation.ts`)
```typescript
export const docsNavigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quick-start" },
    ],
  },
  {
    title: "Commands",
    items: [
      { title: "Overview", href: "/docs/commands" },
      { title: "auth", href: "/docs/commands/auth" },
      { title: "repo", href: "/docs/commands/repo" },
      { title: "skill", href: "/docs/commands/skill" },
    ],
  },
  {
    title: "Skills",
    items: [
      { title: "Overview", href: "/docs/skills" },
      { title: "Creating Skills", href: "/docs/skills/creating" },
      { title: "Skill Format", href: "/docs/skills/format" },
    ],
  },
]
```

### Docs Layout
Three-column layout on desktop:
1. **Left Sidebar** - Navigation tree
2. **Center Content** - MDX content
3. **Right TOC** - Table of contents

On mobile: sidebar in drawer, no TOC.

### Docs Sidebar (`components/docs/docs-sidebar.tsx`)
- Collapsible section groups
- Active page highlighted
- Mobile: slide-out drawer

### Docs TOC (`components/docs/docs-toc.tsx`)
- Extract h2/h3 headings from content
- Scrollspy to highlight current section
- Click to scroll to heading

### Docs Pagination (`components/docs/docs-pagination.tsx`)
- Previous page link
- Next page link
- Based on navigation order

### Initial Documentation Content
```
content/docs/
├── index.mdx           # Introduction
├── installation.mdx    # Installation guide
├── quick-start.mdx     # Quick start tutorial
├── commands/
│   ├── index.mdx       # Commands overview
│   ├── auth.mdx        # auth commands
│   ├── repo.mdx        # repo commands
│   └── skill.mdx       # skill commands
└── skills/
    ├── index.mdx       # Skills overview
    ├── creating.mdx    # Creating skills
    └── format.mdx      # SKILL.md format
```

## Acceptance Criteria
See features.json for testable criteria.

## Dependencies
- web01-project-setup (content-collections)
- web02-core-layout (layout)
- web07-cli-landing-page (CLI theme variables and typography)
- web09-layout-review (component structure)

## Component Structure
```
packages/websites/components/
├── home/         # Home page sections
├── layout/       # Header, footer, container, nav
├── shared/       # Utilities: link, icon, prose, mdx
├── ui/           # shadcn components: button, card, dialog
├── posts/        # Blog components (web04)
└── docs/         # Docs components (new)
```

## Theme Integration
The docs pages should use the CLI theme variables from web07:
- Use `--cli-primary` (green) for inline code, commands, and active nav items
- Use `--cli-secondary` (orange) for links
- Use IBM Plex Mono font for code blocks
- Keep prose content readable with `--cli-text-100` colors
- Sidebar navigation should use primary color for active items
- Support both dark and light modes via the CSS variables

## Out of Scope
- Search within docs
- Version switching
- Edit on GitHub links
