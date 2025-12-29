import { Link } from "~/components/shared/link"
import { Icon } from "~/components/shared/icon"
import { docsNavigation, type NavItem } from "~/config/navigation"

interface DocsPaginationProps {
  currentPath: string
}

function getAllDocsLinks(): NavItem[] {
  return docsNavigation.flatMap((group) => group.items)
}

export function DocsPagination({ currentPath }: DocsPaginationProps) {
  const allLinks = getAllDocsLinks()
  const currentIndex = allLinks.findIndex((item) => item.href === currentPath)

  const prev = currentIndex > 0 ? allLinks[currentIndex - 1] : null
  const next = currentIndex < allLinks.length - 1 ? allLinks[currentIndex + 1] : null

  if (!prev && !next) {
    return null
  }

  return (
    <nav className="flex items-center justify-between gap-4 border-t border-border pt-6 mt-8">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ChevronLeft" className="size-4" />
          <span>{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{next.title}</span>
          <Icon name="ChevronRight" className="size-4" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
