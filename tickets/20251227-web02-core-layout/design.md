# Web02: Core Layout Components

## Overview
Build the core layout structure including root layout, web layout, header, and footer components. These form the foundation for all pages.

## Requirements
- Create root layout with fonts, metadata, and global providers
- Create web layout with container and page structure
- Build simplified header component with navigation
- Build simplified footer component with links
- Ensure responsive design for mobile/desktop

## Technical Details

### Root Layout (`app/layout.tsx`)
```typescript
- Import Inter/Geist fonts
- Set up metadata defaults
- Wrap children with providers (if needed)
- Include global styles
```

### Web Layout (`app/(web)/layout.tsx`)
```typescript
- Fixed header at top
- Main content area with container
- Footer at bottom
- Proper spacing and structure
```

### Header Component (`components/web/header.tsx`)
Simplified from OpenAlternative:
- Logo on left
- Navigation links: Docs, Blog, GitHub (external)
- Mobile hamburger menu
- No search, no user menu, no dropdowns

### Footer Component (`components/web/footer.tsx`)
Simplified from OpenAlternative:
- Newsletter signup (optional)
- Quick links: Docs, Blog, GitHub, About
- Social links: Twitter, GitHub
- Copyright notice

### Navigation Configuration
```typescript
// config/navigation.ts
export const mainNavigation = [
  { title: "Docs", href: "/docs" },
  { title: "Blog", href: "/blog" },
  { title: "GitHub", href: "https://github.com/skilluse/skilluse", external: true },
]
```

## Acceptance Criteria
See features.json for testable criteria.

## Dependencies
- web01-project-setup (components and config)

## Out of Scope
- Landing page sections (web03)
- Newsletter backend integration
- User authentication
