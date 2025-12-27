import type { ComponentProps } from "react"
import { Icon } from "~/components/common/icon"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Container } from "~/components/web/ui/container"
import { NavLink } from "~/components/web/ui/nav-link"
import { config } from "~/config"
import { cx } from "~/utils/cva"

type FooterProps = ComponentProps<"footer">

export const Footer = ({ className, ...props }: FooterProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cx("mt-auto border-t bg-muted/30", className)}
      {...props}
    >
      <Container>
        <div className="py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold">
                <span className="text-primary">⚡</span>
                <span>{config.site.name}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {config.site.tagline}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Links</h3>
              <Stack direction="column" className="text-sm">
                {config.navigation.footer.quickLinks.map((item) => (
                  <NavLink key={item.href} href={item.href}>
                    {item.title}
                  </NavLink>
                ))}
              </Stack>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-semibold">Connect</h3>
              <Stack className="gap-4">
                {config.navigation.footer.social.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={item.title}
                  >
                    {item.title === "GitHub" && <Icon name="Github" className="size-5" />}
                    {item.title === "X" && <Icon name="Twitter" className="size-5" />}
                  </Link>
                ))}
              </Stack>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
            <p>© {currentYear} {config.site.name}. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
