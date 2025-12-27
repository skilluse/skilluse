import Link from "next/link"
import type { ComponentProps } from "react"
import { config } from "~/config"
import { cx } from "~/utils/cva"

type LogoProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string
}

export const Logo = ({ className, href = "/", ...props }: LogoProps) => {
  return (
    <Link
      href={href}
      className={cx(
        "flex items-center gap-2 text-xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity",
        className
      )}
      {...props}
    >
      <span className="text-primary">⚡</span>
      <span>{config.site.name}</span>
    </Link>
  )
}
