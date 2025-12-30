# Web03: Landing Page

## Overview
Build the marketing landing page with hero section, features, how-it-works guide, supported agents showcase, and call-to-action sections.

## Requirements
- Hero section with tagline, description, and CTA buttons
- Terminal demo animation showing CLI usage
- Features grid highlighting key benefits
- How-it-works step-by-step guide
- Supported agents section with logos
- Final CTA section

## Technical Details

### Page Structure (`app/(web)/(home)/page.tsx`)
```typescript
export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <SupportedAgents />
      <CTA />
    </>
  )
}
```

### Hero Section (`components/web/home/hero.tsx`)
- Main headline: "Manage AI Agent Skills with Ease"
- Subheadline: CLI description
- Two CTA buttons: "Get Started" (primary), "View on GitHub" (secondary)
- Terminal demo showing:
  ```
  $ skilluse install code-review
  ✔ Installed code-review to .claude/skills/
  ```
- Background gradient or pattern

### Features Section (`components/web/home/features.tsx`)
Four feature cards in a grid:
1. **GitHub Auth** - Secure OAuth Device Flow authentication
2. **Repo Management** - Add public & private repos as skill sources
3. **Quick Install** - One command to install skills locally or globally
4. **Easy Updates** - Keep skills up to date with simple commands

### How It Works (`components/web/home/how-it-works.tsx`)
Three steps with code examples:
1. Authenticate: `skilluse login`
2. Add Repos: `skilluse repo add owner/repo`
3. Install Skills: `skilluse install skill-name`

### Supported Agents (`components/web/home/supported-agents.tsx`)
Display logos/cards for:
- Claude Code
- Codex CLI
- VS Code
- Cursor
- Custom (user-defined)

### CTA Section (`components/web/home/cta.tsx`)
- Headline: "Ready to supercharge your AI?"
- Two buttons: "Get Started", "Read the Docs"
- Background styling to stand out

## Acceptance Criteria
See features.json for testable criteria.

## Dependencies
- web02-core-layout (header, footer, container)

## Out of Scope
- Newsletter form (can add later)
- Testimonials (can add later)
- Pricing section
