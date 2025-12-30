import Image from "next/image"
import type { ComponentProps } from "react"
import { Icon } from "~/components/shared/icon"
import { Link } from "~/components/shared/link"
import { Mermaid } from "~/components/mdx/mermaid"
import { cx } from "~/utils/cva"

// Links
const a = ({ href, ...props }: ComponentProps<"a">) => {
  if (typeof href !== "string") {
    return <div {...(props as ComponentProps<"div">)} />
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href} {...props} />
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/link"
      {...props}
    >
      {props.children}
      <Icon
        name="ArrowUpRight"
        className="inline-block ml-0.5 mb-0.5 size-3.5 transition-transform duration-100 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
      />
    </a>
  )
}

// Images
const img = ({ className, ...props }: ComponentProps<"img">) => {
  if (typeof props.src !== "string" || typeof props.alt !== "string") {
    throw new TypeError("Image src and alt are required")
  }

  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={1280}
      height={720}
      loading="lazy"
      className={cx("w-full rounded-lg border", className)}
    />
  )
}

// Headings
const h1 = ({ className, ...props }: ComponentProps<"h1">) => (
  <h1
    className={cx(
      "text-3xl md:text-4xl font-semibold tracking-tight text-foreground scroll-mt-20 mt-8 mb-4 first:mt-0",
      className
    )}
    {...props}
  />
)

const h2 = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2
    className={cx(
      "text-2xl md:text-3xl font-semibold tracking-tight text-foreground scroll-mt-20 mt-10 mb-4 pb-2 border-b border-border first:mt-0",
      className
    )}
    {...props}
  />
)

const h3 = ({ className, ...props }: ComponentProps<"h3">) => (
  <h3
    className={cx(
      "text-xl md:text-2xl font-semibold tracking-tight text-foreground scroll-mt-20 mt-8 mb-3 first:mt-0",
      className
    )}
    {...props}
  />
)

const h4 = ({ className, ...props }: ComponentProps<"h4">) => (
  <h4
    className={cx(
      "text-lg md:text-xl font-semibold tracking-tight text-foreground scroll-mt-20 mt-6 mb-2 first:mt-0",
      className
    )}
    {...props}
  />
)

const h5 = ({ className, ...props }: ComponentProps<"h5">) => (
  <h5
    className={cx(
      "text-base font-medium text-foreground scroll-mt-20 mt-4 mb-2 first:mt-0",
      className
    )}
    {...props}
  />
)

const h6 = ({ className, ...props }: ComponentProps<"h6">) => (
  <h6
    className={cx(
      "text-sm font-medium text-muted-foreground scroll-mt-20 mt-4 mb-2 first:mt-0",
      className
    )}
    {...props}
  />
)

// Paragraph
const p = ({ className, ...props }: ComponentProps<"p">) => (
  <p
    className={cx("leading-relaxed text-pretty my-4 first:mt-0 last:mb-0", className)}
    {...props}
  />
)

// Lists
const ul = ({ className, ...props }: ComponentProps<"ul">) => (
  <ul
    className={cx("my-4 pl-6 list-disc [&>li]:mt-2 [&>li:first-child]:mt-0 [&>li]:marker:text-muted-foreground", className)}
    {...props}
  />
)

const ol = ({ className, ...props }: ComponentProps<"ol">) => (
  <ol
    className={cx("my-4 pl-6 list-decimal [&>li]:mt-2 [&>li:first-child]:mt-0 [&>li]:marker:text-muted-foreground [&>li]:marker:font-medium", className)}
    {...props}
  />
)

const li = ({ className, ...props }: ComponentProps<"li">) => (
  <li className={cx("leading-relaxed", className)} {...props} />
)

// Code blocks
const pre = ({ className, ...props }: ComponentProps<"pre">) => (
  <pre
    className={cx(
      "my-4 p-4 rounded-lg border border-border bg-[#24292e] font-mono text-sm overflow-x-auto",
      className
    )}
    {...props}
  />
)

// Inline code
const code = ({ className, ...props }: ComponentProps<"code">) => {
  // Check if this is inside a pre (code block) - don't style it
  const isInPre = className?.includes("hljs") || className?.includes("language-")
  if (isInPre) {
    return <code className={className} {...props} />
  }

  return (
    <code
      className={cx(
        "bg-foreground/10 rounded mx-[0.088em] px-[0.33em] py-[0.166em] font-mono text-[0.875em]",
        className
      )}
      {...props}
    />
  )
}

// Blockquote
const blockquote = ({ className, ...props }: ComponentProps<"blockquote">) => (
  <blockquote
    className={cx(
      "my-4 pl-4 border-l-4 border-muted-foreground/30 text-muted-foreground italic",
      className
    )}
    {...props}
  />
)

// Horizontal rule
const hr = ({ className, ...props }: ComponentProps<"hr">) => (
  <hr className={cx("my-8 border-border", className)} {...props} />
)

// Table
const table = ({ className, ...props }: ComponentProps<"table">) => (
  <div className="my-4 overflow-x-auto">
    <table
      className={cx("w-full border-collapse border border-border text-sm", className)}
      {...props}
    />
  </div>
)

const thead = ({ className, ...props }: ComponentProps<"thead">) => (
  <thead className={cx("bg-muted", className)} {...props} />
)

const th = ({ className, ...props }: ComponentProps<"th">) => (
  <th
    className={cx("p-3 text-left font-semibold border border-border", className)}
    {...props}
  />
)

const td = ({ className, ...props }: ComponentProps<"td">) => (
  <td className={cx("p-3 border border-border", className)} {...props} />
)

const tr = ({ className, ...props }: ComponentProps<"tr">) => (
  <tr className={cx("border-b border-border last:border-b-0", className)} {...props} />
)

// Strong and emphasis
const strong = ({ className, ...props }: ComponentProps<"strong">) => (
  <strong className={cx("font-semibold text-foreground", className)} {...props} />
)

const em = ({ className, ...props }: ComponentProps<"em">) => (
  <em className={cx("italic", className)} {...props} />
)

export const MDXComponents = {
  // Links and media
  a,
  img,
  // Headings
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  // Text
  p,
  strong,
  em,
  // Lists
  ul,
  ol,
  li,
  // Code
  pre,
  code,
  // Blocks
  blockquote,
  hr,
  // Tables
  table,
  thead,
  th,
  td,
  tr,
  // Custom
  Mermaid,
  mermaid: Mermaid,
}
