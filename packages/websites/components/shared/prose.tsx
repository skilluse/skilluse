import type { ComponentProps } from "react"
import { cx } from "~/utils/cva"

export const Prose = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx(
        // Base prose - disable default table/list/code styles (handled by MDX components)
        "prose prose-lg prose-neutral dark:prose-invert leading-relaxed text-pretty",
        // Disable prose defaults for elements handled by MDX components
        "prose-table:my-0 prose-thead:border-0 prose-tr:border-0 prose-th:p-0 prose-td:p-0",
        "prose-ul:my-0 prose-ul:pl-0 prose-ul:list-none prose-ol:my-0 prose-ol:pl-0 prose-ol:list-none prose-li:my-0 prose-li:pl-0",
        "prose-pre:my-0 prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0",
        "prose-code:before:hidden prose-code:after:hidden prose-code:bg-transparent prose-code:p-0 prose-code:font-normal",
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
        // Images with border
        "prose-img:rounded-lg prose-img:border",
        // Lead text
        "prose-lead:text-lg/relaxed",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:not-italic prose-blockquote:text-muted-foreground",
        // Horizontal rule
        "prose-hr:border-border",
        // Mermaid diagrams
        "[&_.mermaid]:my-6 [&_.mermaid]:flex [&_.mermaid]:justify-center",
        className,
      )}
      {...props}
    />
  )
}
