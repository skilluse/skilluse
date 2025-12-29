"use client"

import { useEffect } from "react"
import { config } from "~/config"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="border border-border p-8 md:p-12 max-w-lg">
        <div className="text-6xl font-bold text-muted-foreground mb-4">!</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-border text-foreground hover:bg-muted transition-colors"
          >
            Go Home
          </a>
          <a
            href={`${config.site.github}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-border text-foreground hover:bg-muted transition-colors"
          >
            Report Issue
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
