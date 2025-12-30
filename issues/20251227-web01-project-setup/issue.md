# Web01: Website Project Setup

## Overview
Initialize the Next.js website project in `packages/websites/` with all necessary configurations and copy reusable components from OpenAlternative.

## Requirements
- Initialize Next.js project with TypeScript and App Router
- Configure Tailwind CSS v4
- Set up content-collections for MDX
- Copy common components from OpenAlternative
- Set up project configuration files

## Technical Details

### Project Initialization
```bash
cd packages/websites
bunx create-next-app@canary . --typescript --tailwind --eslint --app --src-dir=false --import-alias="~/*"
```

### Files to Copy from OpenAlternative
1. **Common Components** (`components/common/`):
   - button.tsx, card.tsx, badge.tsx, heading.tsx
   - icon.tsx, link.tsx, stack.tsx, prose.tsx
   - skeleton.tsx, tooltip.tsx, dropdown-menu.tsx
   - box.tsx, separator.tsx, slottable.tsx

2. **Web UI Components** (`components/web/ui/`):
   - container.tsx, intro.tsx, grid.tsx
   - breadcrumbs.tsx, nav-link.tsx, section.tsx

3. **Utility Files**:
   - utils/cva.ts
   - lib/utils.ts (if exists)

4. **Configuration Files**:
   - biome.json
   - tailwind.config.ts (adapt)
   - postcss.config.js

### Directory Structure
```
packages/websites/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── common/
│   └── web/
├── config/
│   ├── index.ts
│   ├── site.ts
│   ├── links.ts
│   └── metadata.ts
├── content/
│   ├── posts/
│   └── docs/
├── utils/
│   └── cva.ts
├── content-collections.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Acceptance Criteria
See features.json for testable criteria.

## Dependencies
None (first ticket)

## Out of Scope
- Header/Footer components (web02)
- Landing page content (web03)
- Blog functionality (web04)
- Docs functionality (web05)
