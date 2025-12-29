import type { ComponentProps } from "react"
import { cx } from "~/utils/cva"

export const Prose = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx(
        // Base prose with relaxed line height
        "prose prose-lg prose-neutral dark:prose-invert leading-relaxed",
        // Paragraphs and list spacing
        "prose-p:first:mt-0 prose-p:last:mb-0",
        "prose-ul:first:mt-0 prose-ul:last:mb-0 prose-li:mt-2 prose-li:first:m-0",
        // Links with subtle underline and hover animation
        "prose-a:font-medium prose-a:text-foreground prose-a:decoration-foreground/30 prose-a:underline-offset-[3px] prose-a:decoration-[0.075em]",
        "prose-a:transition-colors prose-a:duration-100 prose-a:ease-out",
        "hover:prose-a:text-primary hover:prose-a:decoration-primary/60",
        // Strong text
        "prose-strong:text-foreground",
        // Headings with scroll offset
        "prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-headings:scroll-mt-20",
        // Inline code - em-based spacing
        "prose-code:before:hidden prose-code:after:hidden prose-code:bg-foreground/10 prose-code:rounded prose-code:mx-[0.088em] prose-code:px-[0.33em] prose-code:py-[0.166em] prose-code:font-normal",
        // Code blocks
        "prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-[#24292e] prose-pre:font-mono",
        // Images with border
        "prose-img:rounded-lg prose-img:border",
        // Lead text
        "prose-lead:text-lg/relaxed",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:not-italic",
        // Mermaid diagrams
        "[&_.mermaid]:my-6 [&_.mermaid]:flex [&_.mermaid]:justify-center",
        className,
      )}
      {...props}
    />
  )
}
