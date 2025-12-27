"use client"

import { usePathname } from "next/navigation"
import { type ComponentProps, useEffect, useState } from "react"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Container } from "~/components/web/ui/container"
import { Hamburger } from "~/components/web/ui/hamburger"
import { Logo } from "~/components/web/ui/logo"
import { NavLink } from "~/components/web/ui/nav-link"
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
    <div
      className={cx("fixed top-(--header-top) inset-x-0 z-50 bg-background", className)}
      id="header"
      role="banner"
      data-state={isNavOpen ? "open" : "close"}
      {...props}
    >
      <Container>
        <div className="flex items-center py-3.5 gap-4 text-sm h-(--header-height) md:gap-6">
          <Stack size="sm" wrap={false} className="mr-auto">
            <button
              type="button"
              onClick={() => setNavOpen(!isNavOpen)}
              className="block -m-1 -ml-1.5 lg:hidden"
            >
              <Hamburger className="size-7" />
            </button>

            <Logo />
          </Stack>

          {/* Desktop Navigation */}
          <nav className="flex flex-wrap gap-4 max-lg:hidden">
            {config.navigation.main.map((item) =>
              item.external ? (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.title}
                </Link>
              ) : (
                <NavLink key={item.href} href={item.href}>
                  {item.title}
                </NavLink>
              )
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <nav
          className={cx(
            "absolute top-full inset-x-0 h-[calc(100dvh-var(--header-top)-var(--header-height))] -mt-px py-4 px-6 grid grid-cols-2 place-items-start place-content-start gap-x-4 gap-y-6 bg-background/90 backdrop-blur-lg transition-opacity lg:hidden",
            isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {config.navigation.main.map((item) =>
            item.external ? (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-muted-foreground hover:text-foreground"
              >
                {item.title}
              </Link>
            ) : (
              <NavLink key={item.href} href={item.href} className="text-base">
                {item.title}
              </NavLink>
            )
          )}
        </nav>
      </Container>
    </div>
  )
}

const HeaderBackdrop = () => {
  return (
    <div className="fixed top-(--header-offset) inset-x-0 z-40 h-8 pointer-events-none bg-linear-to-b from-background to-transparent" />
  )
}

export { Header, HeaderBackdrop, type HeaderProps }
