import { notFound } from "next/navigation"
import { allDocs } from "content-collections"
import { MDX } from "~/components/mdx/mdx"
import { DocsToc } from "~/components/docs/docs-toc"
import { DocsPagination } from "~/components/docs/docs-pagination"

interface DocsPageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  return allDocs
    .filter((doc) => doc.slug !== "")
    .map((doc) => ({
      slug: doc.slug.split("/"),
    }))
}

export async function generateMetadata({ params }: DocsPageProps) {
  const { slug } = await params
  const slugPath = slug.join("/")
  const doc = allDocs.find((d) => d.slug === slugPath)

  if (!doc) {
    return {
      title: "Page Not Found",
    }
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: `${doc.title} | SkillUse Docs`,
      description: doc.description,
      url: `/docs/${slugPath}`,
      type: "article",
    },
    alternates: {
      canonical: `/docs/${slugPath}`,
    },
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params
  const slugPath = slug.join("/")
  const doc = allDocs.find((d) => d.slug === slugPath)

  if (!doc) {
    notFound()
  }

  const currentPath = `/docs/${slugPath}`

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

        <MDX code={doc.content} className="max-w-none!" />

        <DocsPagination currentPath={currentPath} />
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
