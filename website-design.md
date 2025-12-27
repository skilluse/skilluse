# SkillUse Website Design

## Overview

A marketing website for SkillUse - a CLI tool for managing AI Agent Skills. The website will include:
- **Landing Page**: Hero section, features, social proof
- **Blog**: Articles about AI agents, skills, tutorials
- **Docs**: Documentation for the CLI and skill development

## Technology Stack (Reused from OpenAlternative)

| Category | Technology |
|----------|------------|
| Framework | Next.js (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | Radix UI |
| Content | content-collections (MDX) |
| State | nuqs (URL state) |
| Forms | react-hook-form + zod |
| Animation | motion |
| Package Manager | Bun |

## Project Structure

```
packages/websites/
├── app/
│   ├── (web)/
│   │   ├── (home)/
│   │   │   └── page.tsx              # Landing page
│   │   ├── blog/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx          # Blog post detail
│   │   │   └── page.tsx              # Blog listing
│   │   ├── docs/
│   │   │   ├── [...slug]/
│   │   │   │   └── page.tsx          # Docs page
│   │   │   └── page.tsx              # Docs index
│   │   ├── about/
│   │   │   └── page.tsx              # About page
│   │   ├── layout.tsx                # Web layout
│   │   ├── error.tsx                 # Error page
│   │   └── not-found.tsx             # 404 page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── favicon.ico
├── components/
│   ├── common/                       # Reused from OpenAlternative
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── heading.tsx
│   │   ├── icon.tsx
│   │   ├── link.tsx
│   │   ├── stack.tsx
│   │   ├── prose.tsx
│   │   └── ...
│   └── web/
│       ├── header.tsx                # Site header
│       ├── footer.tsx                # Site footer
│       ├── newsletter-form.tsx       # Newsletter subscription
│       ├── posts/
│       │   ├── post-card.tsx         # Blog post card
│       │   └── post-content.tsx      # Blog post content
│       ├── docs/
│       │   ├── docs-sidebar.tsx      # Docs navigation
│       │   ├── docs-toc.tsx          # Table of contents
│       │   └── docs-pagination.tsx   # Prev/next navigation
│       ├── home/
│       │   ├── hero.tsx              # Hero section
│       │   ├── features.tsx          # Features section
│       │   ├── how-it-works.tsx      # How it works
│       │   ├── cta.tsx               # Call to action
│       │   └── testimonials.tsx      # Social proof
│       └── ui/
│           ├── container.tsx
│           ├── intro.tsx
│           ├── grid.tsx
│           ├── breadcrumbs.tsx
│           └── section.tsx
├── content/
│   ├── posts/                        # Blog posts (MDX)
│   │   └── getting-started.mdx
│   └── docs/                         # Documentation (MDX)
│       ├── index.mdx
│       ├── installation.mdx
│       ├── authentication.mdx
│       ├── commands/
│       │   ├── index.mdx
│       │   ├── auth.mdx
│       │   ├── repo.mdx
│       │   └── skill.mdx
│       └── skills/
│           ├── index.mdx
│           ├── creating-skills.mdx
│           └── skill-format.mdx
├── config/
│   ├── index.ts                      # Config aggregator
│   ├── site.ts                       # Site metadata
│   ├── links.ts                      # External links
│   ├── metadata.ts                   # SEO defaults
│   └── navigation.ts                 # Navigation config
├── lib/
│   └── utils.ts                      # Utility functions
├── utils/
│   └── cva.ts                        # Class variance authority
├── content-collections.ts            # Content config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Page Designs

### 1. Landing Page (`/`)

#### Hero Section
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                     Manage AI Agent Skills with Ease                        │
│                                                                             │
│          A powerful CLI tool to discover, install, and manage               │
│          skills for Claude Code, Codex CLI, and more.                       │
│                                                                             │
│          [Get Started]  [View on GitHub]                                    │
│                                                                             │
│          $ skilluse install code-review                                     │
│          ✔ Installed code-review to .claude/skills/                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Features Section
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Why SkillUse?                                     │
├────────────────────┬────────────────────┬────────────────────┬──────────────┤
│  GitHub Auth       │  Repo Management   │  Quick Install     │  Updates     │
│                    │                    │                    │              │
│  Secure OAuth      │  Add public &      │  One command to    │  Keep skills │
│  Device Flow       │  private repos     │  install skills    │  up to date  │
│  authentication    │  as skill sources  │  locally or global │  easily      │
└────────────────────┴────────────────────┴────────────────────┴──────────────┘
```

#### How It Works
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          How It Works                                       │
│                                                                             │
│  1. Authenticate      2. Add Repos         3. Install Skills                │
│  ──────────────       ────────────         ────────────────                 │
│  skilluse login       skilluse repo add    skilluse install                 │
│                       owner/repo           skill-name                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Supported Agents
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Supported AI Agents                                  │
│                                                                             │
│  [Claude Code]  [Codex CLI]  [VS Code]  [Cursor]  [Custom]                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### CTA Section
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                      Ready to supercharge your AI?                          │
│                                                                             │
│              [Get Started]        [Read the Docs]                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Blog (`/blog`)

#### Blog Listing Page
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Home > Blog                                                                │
│                                                                             │
│  SkillUse Blog                                                              │
│  Articles about AI agents, skills development, and best practices.         │
│                                                                             │
├─────────────────────────────┬───────────────────────────────────────────────┤
│  ┌─────────────────────┐    │  ┌─────────────────────┐                      │
│  │      [Image]        │    │  │      [Image]        │                      │
│  ├─────────────────────┤    │  ├─────────────────────┤                      │
│  │ Getting Started     │    │  │ Creating Custom     │                      │
│  │ with SkillUse       │    │  │ Skills              │                      │
│  │                     │    │  │                     │                      │
│  │ Dec 27, 2025        │    │  │ Dec 25, 2025        │                      │
│  └─────────────────────┘    │  └─────────────────────┘                      │
└─────────────────────────────┴───────────────────────────────────────────────┘
```

#### Blog Post Page (`/blog/[slug]`)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Home > Blog > Getting Started with SkillUse                               │
│                                                                             │
│  Getting Started with SkillUse                                              │
│                                                                             │
│  Published Dec 27, 2025 · 5 min read                                        │
│  By Author Name                                                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [MDX Content rendered here]                                                │
│                                                                             │
│  ## Introduction                                                            │
│  ...                                                                        │
│                                                                             │
│  ## Installation                                                            │
│  ```bash                                                                    │
│  npm install -g skilluse                                                    │
│  ```                                                                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Share: Twitter] [LinkedIn] [Copy Link]                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Docs (`/docs`)

#### Docs Index Page
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Sidebar         │  Content                                                 │
├──────────────────┼──────────────────────────────────────────────────────────┤
│  Getting Started │  # SkillUse Documentation                                │
│  ├─ Installation │                                                          │
│  ├─ Quick Start  │  Welcome to SkillUse! This documentation will help      │
│  └─ Config       │  you get started with managing AI agent skills.          │
│                  │                                                          │
│  Commands        │  ## Quick Links                                          │
│  ├─ auth         │  - [Installation](/docs/installation)                   │
│  ├─ repo         │  - [Quick Start](/docs/quick-start)                     │
│  └─ skill        │  - [Commands Reference](/docs/commands)                 │
│                  │                                                          │
│  Skills          │  ## Getting Help                                         │
│  ├─ Creating     │  - [GitHub Issues](...)                                  │
│  ├─ Format       │  - [Discussions](...)                                    │
│  └─ Publishing   │                                                          │
│                  │                                   [Next: Installation →] │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

#### Docs Detail Page (`/docs/[...slug]`)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Sidebar         │  Content                               │ TOC            │
├──────────────────┼────────────────────────────────────────┼────────────────┤
│  Getting Started │  # Installation                        │ On this page   │
│  ├─ Installation │                                        │ ├─ Prerequisites│
│  ├─ Quick Start  │  ## Prerequisites                     │ ├─ npm         │
│  └─ Config       │  - Node.js 18+                        │ ├─ Homebrew    │
│                  │  - npm or bun                         │ └─ Verify      │
│  Commands        │                                        │                │
│  ├─ auth         │  ## Install via npm                   │                │
│  ├─ repo         │  ```bash                              │                │
│  └─ skill        │  npm install -g skilluse              │                │
│                  │  ```                                   │                │
│  Skills          │                                        │                │
│  ├─ Creating     │  ## Install via Homebrew              │                │
│  ├─ Format       │  ```bash                              │                │
│  └─ Publishing   │  brew install skilluse                │                │
│                  │  ```                                   │                │
│                  │                                        │                │
│                  │  ## Verify Installation                │                │
│                  │  ```bash                              │                │
│                  │  skilluse --version                   │                │
│                  │  ```                                   │                │
│                  │                                        │                │
│                  │  [← Previous]        [Next →]         │                │
└──────────────────┴────────────────────────────────────────┴────────────────┘
```

## Content Collections Configuration

```typescript
// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core"
import { type Options, compileMDX } from "@content-collections/mdx"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import rehypePrettyCode from "rehype-pretty-code"

const mdxOptions: Options = {
  rehypePlugins: [
    rehypeSlug,
    rehypeAutolinkHeadings,
    [rehypePrettyCode, { theme: "github-dark" }],
  ],
}

// Blog posts
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

// Documentation
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
    // Extract headings for TOC
    const headings = extractHeadings(data.content)
    return { ...data, content, headings }
  },
})

export default defineConfig({
  collections: [posts, docs],
})
```

## Site Configuration

```typescript
// config/site.ts
export const siteConfig = {
  name: "SkillUse",
  tagline: "Manage AI Agent Skills with Ease",
  description:
    "A powerful CLI tool to discover, install, and manage skills for Claude Code, Codex CLI, and more AI coding assistants.",
  url: "https://skilluse.ai",
  email: "hello@skilluse.ai",
  github: "https://github.com/skilluse/skilluse",
}
```

```typescript
// config/navigation.ts
export const docsNavigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quick-start" },
      { title: "Configuration", href: "/docs/configuration" },
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
      { title: "Publishing", href: "/docs/skills/publishing" },
    ],
  },
]

export const mainNavigation = [
  { title: "Docs", href: "/docs" },
  { title: "Blog", href: "/blog" },
  { title: "GitHub", href: "https://github.com/skilluse/skilluse", external: true },
]
```

## Reused Components from OpenAlternative

### Common Components (Direct Copy)
- `components/common/button.tsx`
- `components/common/card.tsx`
- `components/common/badge.tsx`
- `components/common/heading.tsx`
- `components/common/icon.tsx`
- `components/common/link.tsx`
- `components/common/stack.tsx`
- `components/common/prose.tsx`
- `components/common/skeleton.tsx`
- `components/common/tooltip.tsx`
- `components/common/dropdown-menu.tsx`

### Web UI Components (Direct Copy)
- `components/web/ui/container.tsx`
- `components/web/ui/intro.tsx`
- `components/web/ui/grid.tsx`
- `components/web/ui/breadcrumbs.tsx`
- `components/web/ui/nav-link.tsx`

### Web Components (Adapt)
- `components/web/header.tsx` - Simplify navigation
- `components/web/footer.tsx` - Simplify links
- `components/web/newsletter-form.tsx` - Keep as is
- `components/web/posts/post-card.tsx` - Keep as is

### Utility Files (Direct Copy)
- `utils/cva.ts`
- `lib/utils.ts`

## New Components to Create

### Docs-Specific Components
```typescript
// components/web/docs/docs-sidebar.tsx
// Navigation sidebar for docs

// components/web/docs/docs-toc.tsx
// Table of contents (extracted from headings)

// components/web/docs/docs-pagination.tsx
// Previous/Next navigation
```

### Landing Page Components
```typescript
// components/web/home/hero.tsx
// Hero section with terminal animation

// components/web/home/features.tsx
// Feature cards grid

// components/web/home/how-it-works.tsx
// Step-by-step guide

// components/web/home/supported-agents.tsx
// Agent logos/cards

// components/web/home/cta.tsx
// Call to action section
```

## Dependencies

```json
{
  "dependencies": {
    "@content-collections/core": "^0.7.3",
    "@content-collections/mdx": "^0.2.2",
    "@content-collections/next": "^0.2.4",
    "@hookform/resolvers": "^3.10.0",
    "cva": "beta",
    "motion": "^12.18.1",
    "next": "canary",
    "nuqs": "^2.4.3",
    "radix-ui": "^1.4.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.58.1",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-pretty-code": "^0.14.0",
    "rehype-slug": "^6.0.0",
    "shiki": "^1.24.0",
    "tailwind-merge": "^3.3.1",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@tailwindcss/postcss": "^4.1.10",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^22.15.32",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.10",
    "typescript": "^5.8.3"
  }
}
```

## Implementation Phases

### Phase 1: Project Setup
1. Initialize packages/websites with Next.js + TypeScript
2. Copy common components from OpenAlternative
3. Copy utility files and configurations
4. Set up Tailwind CSS v4
5. Configure content-collections for MDX

### Phase 2: Core Layout
6. Create root layout with fonts and styles
7. Build simplified header component
8. Build simplified footer component
9. Create web layout with container

### Phase 3: Landing Page
10. Build hero section with terminal demo
11. Build features section
12. Build how-it-works section
13. Build supported agents section
14. Build CTA section
15. Assemble landing page

### Phase 4: Blog
16. Set up blog content collection
17. Create blog listing page
18. Create blog post detail page
19. Build post card component
20. Add share buttons

### Phase 5: Docs
21. Set up docs content collection with TOC extraction
22. Build docs sidebar component
23. Build docs TOC component
24. Build docs pagination component
25. Create docs index page
26. Create docs detail page with [...slug]
27. Write initial documentation content

### Phase 6: Polish
28. Add SEO metadata to all pages
29. Add Open Graph images
30. Add sitemap generation
31. Add 404 and error pages
32. Mobile responsiveness testing
33. Performance optimization

## Key Differences from OpenAlternative

| Aspect | OpenAlternative | SkillUse Website |
|--------|-----------------|------------------|
| Purpose | SaaS directory | CLI marketing site |
| Database | PostgreSQL + Drizzle | None (static) |
| Auth | better-auth | None |
| Search | Meilisearch | None |
| Content | Tools/Alternatives | Docs/Blog only |
| Payments | Stripe | None |
| Email | Resend | Optional newsletter |

## Files to Remove (Not Needed)

- All database-related code (`db/`, `drizzle.config.ts`)
- Auth components (`auth/`, `better-auth`)
- Admin components (`components/admin/`)
- Data table components (`components/data-table/`)
- Tool/Alternative specific components
- Payment/Stripe integration
- Email templates (`emails/`)
- Inngest functions
- S3 integration
- Search functionality (Meilisearch)
