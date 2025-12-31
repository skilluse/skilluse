import type { ReactNode } from "react"
import { DocsSidebar } from "~/components/docs/docs-sidebar"

type DocsLayoutProps = {
  children: ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    // Use negative margin to extend beyond Container padding, connecting borders with Header/Footer
    <div className="flex -mx-6 md:-mx-8 lg:-mx-10 -my-8 md:-my-10 lg:-my-12">
      {/* Left Sidebar - hidden on mobile */}
      <aside className="hidden md:block w-48 shrink-0 border-r border-border">
        <div className="sticky top-[calc(var(--header-height))] py-8 md:py-10 lg:py-12 pl-6 md:pl-8 lg:pl-10 pr-4">
          <DocsSidebar />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 py-8 md:py-10 lg:py-12 px-6 md:px-8 lg:px-10">
        {children}
      </div>
    </div>
  )
}
