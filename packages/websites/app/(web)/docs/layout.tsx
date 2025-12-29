import type { ReactNode } from "react"
import { DocsSidebar } from "~/components/docs/docs-sidebar"

type DocsLayoutProps = {
  children: ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex gap-8 lg:gap-12">
      {/* Left Sidebar - hidden on mobile */}
      <aside className="hidden md:block w-56 shrink-0 border-r border-border pr-6">
        <div className="sticky top-[calc(var(--header-height)+2rem)]">
          <DocsSidebar />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
