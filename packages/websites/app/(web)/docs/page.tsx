import { notFound } from "next/navigation"
import { allDocs } from "content-collections"
import { MDXContent } from "@content-collections/mdx/react"
import { DocsToc } from "~/components/docs/docs-toc"
import { DocsPagination } from "~/components/docs/docs-pagination"

export const metadata = {
  title: "Documentation | SkillUse",
  description: "Learn how to use SkillUse to share and install AI agent skills",
}

export default function DocsIndexPage() {
  // Find the index doc (slug = "")
  const doc = allDocs.find((d) => d.slug === "")

  if (!doc) {
    notFound()
  }

  return (
    <div className="flex gap-8 lg:gap-12">
      {/* Main content */}
      <article className="flex-1 min-w-0">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
          {doc.description && (
            <p className="mt-2 text-muted-foreground">{doc.description}</p>
          )}
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent code={doc.content} />
        </div>

        <DocsPagination currentPath="/docs" />
      </article>

      {/* Right TOC - hidden on smaller screens */}
      <aside className="hidden xl:block w-48 shrink-0">
        <div className="sticky top-[calc(var(--header-height)+2rem)]">
          <DocsToc headings={doc.headings} />
        </div>
      </aside>
    </div>
  )
}
