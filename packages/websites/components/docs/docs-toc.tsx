"use client"

import { useEffect, useState } from "react"
import { cx } from "~/utils/cva"

type Heading = {
  level: number
  text: string
  id: string
}

interface DocsTocProps {
  headings: Heading[]
}

export function DocsToc({ headings }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    )

    for (const heading of headings) {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="flex flex-col gap-1">
      <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
        On this page
      </h4>
      <ul className="flex flex-col gap-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cx(
                "block text-sm transition-colors",
                heading.level === 3 && "pl-3",
                activeId === heading.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
