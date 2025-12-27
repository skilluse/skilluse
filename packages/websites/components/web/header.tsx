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

type HeaderProps = ComponentProps<"header">

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
      className={cx("fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-b", className)}
      role="banner"
      data-state={isNavOpen ? "open" : "close"}
      {...props}
    >
      <Container>
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {config.navigation.main.map((item) => (
              item.external ? (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              ) : (
                <NavLink key={item.href} href={item.href}>
                  {item.title}
                </NavLink>
              )
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setNavOpen(!isNavOpen)}
            className="group/menu -m-1 p-1 md:hidden"
            aria-label="Toggle menu"
          >
            <Hamburger className="size-7" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav
          className={cx(
            "absolute top-full inset-x-0 bg-background/95 backdrop-blur-sm border-b py-4 px-6 flex flex-col gap-4 transition-opacity md:hidden",
            isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {config.navigation.main.map((item) => (
            item.external ? (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ) : (
              <NavLink key={item.href} href={item.href} className="text-base">
                {item.title}
              </NavLink>
            )
          ))}
        </nav>
      </Container>
    </header>
  )
}

export { Header, type HeaderProps }
