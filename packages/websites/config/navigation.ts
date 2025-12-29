import { linksConfig } from "~/config/links"

export type NavItem = {
  title: string
  href: string
  external?: boolean
}

export type DocsNavGroup = {
  title: string
  items: NavItem[]
}

export const docsNavigation: DocsNavGroup[] = [
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

export const mainNavigation: NavItem[] = [
  { title: "Docs", href: "/docs" },
  { title: "Blog", href: "/blog" },
  { title: "GitHub", href: linksConfig.github, external: true },
]

export const footerNavigation: {
  quickLinks: NavItem[]
  social: NavItem[]
} = {
  quickLinks: [
    { title: "Docs", href: "/docs" },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
  ],
  social: [
    { title: "GitHub", href: linksConfig.github, external: true },
    { title: "X", href: linksConfig.twitter, external: true },
  ],
}
