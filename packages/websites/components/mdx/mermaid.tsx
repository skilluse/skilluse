"use client"

import dynamic from "next/dynamic"

export const Mermaid = dynamic(
  () => import("mdx-mermaid/Mermaid").then((mod) => mod.Mermaid),
  { ssr: false, loading: () => <div className="animate-pulse bg-muted h-32 rounded-lg" /> }
)
