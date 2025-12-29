"use client"

import { usePathname } from "next/navigation"
import { Link } from "~/components/shared/link"
import { docsNavigation } from "~/config/navigation"
import { cx } from "~/utils/cva"

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6">
      {docsNavigation.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            {group.title}
          </h4>
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cx(
                      "block py-1.5 text-sm transition-colors border-l-2 pl-3 -ml-px",
                      isActive
                        ? "text-foreground border-foreground"
                        : "text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
