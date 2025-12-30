import type { ComponentProps } from "react"
import { cx } from "~/utils/cva"

export const Prose = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx(
        // Base prose with relaxed line height
        "prose prose-lg prose-neutral dark:prose-invert leading-relaxed text-pretty",
        // Paragraphs spacing
        "prose-p:first:mt-0 prose-p:last:mb-0",
        // Links with subtle underline and hover animation
        "prose-a:font-medium prose-a:text-foreground prose-a:decoration-foreground/30 prose-a:underline-offset-[3px] prose-a:decoration-[0.075em]",
        "prose-a:transition-colors prose-a:duration-100 prose-a:ease-out",
        "hover:prose-a:text-primary hover:prose-a:decoration-primary/60",
        // Strong text
        "prose-strong:text-foreground",
        // Headings - size hierarchy with scroll offset
        "prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-headings:scroll-mt-20",
        "prose-h1:text-3xl md:prose-h1:text-4xl",
        "prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2",
        "prose-h3:text-xl md:prose-h3:text-2xl",
        "prose-h4:text-lg md:prose-h4:text-xl",
        "prose-h5:text-base prose-h5:font-medium",
        "prose-h6:text-sm prose-h6:font-medium prose-h6:text-muted-foreground",
        // Unordered lists - custom bullet styling
        "prose-ul:first:mt-0 prose-ul:last:mb-0 prose-ul:pl-6",
        "prose-ul:list-disc prose-ul:[&>li]:marker:text-muted-foreground",
        // Ordered lists - custom number styling
        "prose-ol:first:mt-0 prose-ol:last:mb-0 prose-ol:pl-6",
        "prose-ol:list-decimal prose-ol:[&>li]:marker:text-muted-foreground prose-ol:[&>li]:marker:font-medium",
        // List items spacing
        "prose-li:mt-2 prose-li:first:mt-0",
        // Inline code - em-based spacing
        "prose-code:before:hidden prose-code:after:hidden prose-code:bg-foreground/10 prose-code:rounded prose-code:mx-[0.088em] prose-code:px-[0.33em] prose-code:py-[0.166em] prose-code:font-normal prose-code:text-[0.875em]",
        // Code blocks with padding
        "prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:font-mono prose-pre:text-base prose-pre:p-4 prose-pre:overflow-x-auto",
        // Images with border
        "prose-img:rounded-lg prose-img:border",
        // Lead text
        "prose-lead:text-lg/relaxed",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:not-italic prose-blockquote:text-muted-foreground",
        // Horizontal rule
        "prose-hr:border-border",
        // Tables
        "prose-table:border prose-table:border-border prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-border",
        // Mermaid diagrams
        "[&_.mermaid]:my-6 [&_.mermaid]:flex [&_.mermaid]:justify-center",
        className,
      )}
      {...props}
    />
  )
}
