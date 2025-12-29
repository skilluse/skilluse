import Image from "next/image"
import type { ComponentProps } from "react"
import { Icon } from "~/components/shared/icon"
import { Link } from "~/components/shared/link"
import { Mermaid } from "~/components/mdx/mermaid"
import { cx } from "~/utils/cva"

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
      className={cx("w-full rounded-lg", className)}
    />
  )
}

export const MDXComponents = { a, img, Mermaid, mermaid: Mermaid }
