import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="border border-border p-8 md:p-12 max-w-lg">
        <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-border text-foreground hover:bg-muted transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center px-4 py-2 border border-border text-foreground hover:bg-muted transition-colors"
          >
            View Docs
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-4 py-2 border border-border text-foreground hover:bg-muted transition-colors"
          >
            Read Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
