import { linksConfig } from "~/config/links"

export type NavItem = {
  title: string
  href: string
  external?: boolean
}

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
