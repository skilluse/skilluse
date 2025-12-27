"use client"

import { usePathname } from "next/navigation"
import { type ComponentProps, useEffect, useState } from "react"
import { Icon } from "~/components/shared/icon"
import { Link } from "~/components/shared/link"
import { Container } from "~/components/layout/container"
import { Logo } from "~/components/layout/logo"
import { config } from "~/config"
import { cx } from "~/utils/cva"

type HeaderProps = ComponentProps<"div">

const Header = ({ className, ...props }: HeaderProps) => {
  const pathname = usePathname()
  const [isNavOpen, setNavOpen] = useState(false)

  // Close mobile nav on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <header
      className={cx("sticky top-0 z-50 bg-background border-b border-border", className)}
      id="header"
      role="banner"
      data-state={isNavOpen ? "open" : "close"}
      {...props}
    >
      <Container>
        <div className="flex items-center h-(--header-height)">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Middle: Navigation */}
          <nav className="flex-1 flex justify-center gap-10 max-md:hidden">
            {config.navigation.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cx(
                  "text-sm uppercase tracking-wide transition-colors",
                  pathname.startsWith(item.href.split("?")[0])
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-4 max-md:hidden">
            {config.navigation.footer.social.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={item.title}
              >
                {item.title === "GitHub" && <Icon name="Github" className="size-4" />}
                {item.title === "X" && <Icon name="Twitter" className="size-4" />}
              </Link>
            ))}
          </div>

          {/* Mobile: Hamburger */}
          <button
            type="button"
            onClick={() => setNavOpen(!isNavOpen)}
            className="ml-auto p-2 -mr-2 md:hidden"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className={cx(
                "block h-0.5 bg-foreground transition-transform origin-center",
                isNavOpen && "rotate-45 translate-y-2"
              )} />
              <span className={cx(
                "block h-0.5 bg-foreground transition-opacity",
                isNavOpen && "opacity-0"
              )} />
              <span className={cx(
                "block h-0.5 bg-foreground transition-transform origin-center",
                isNavOpen && "-rotate-45 -translate-y-2"
              )} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav
          className={cx(
            "absolute top-full inset-x-0 bg-background border-b-2 border-border transition-all md:hidden",
            isNavOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}
        >
          <Container>
            <div className="py-4 flex flex-col gap-4">
              {config.navigation.main.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={cx(
                    "text-sm uppercase tracking-wide py-2 border-b border-border transition-colors",
                    pathname.startsWith(item.href.split("?")[0])
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
              <div className="flex gap-4 pt-2">
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
              </div>
            </div>
          </Container>
        </nav>
      </Container>
    </header>
  )
}

export { Header, type HeaderProps }
