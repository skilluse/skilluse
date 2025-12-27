import type { ComponentProps } from "react"
import { Container } from "~/components/layout/container"
import { config } from "~/config"
import { cx } from "~/utils/cva"

type FooterProps = ComponentProps<"footer">

export const Footer = ({ className, ...props }: FooterProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cx("mt-auto border-t border-border", className)}
      {...props}
    >
      <div className="flex flex-wrap">
        {/* GitHub */}
        <a
          href={config.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] py-4 text-center text-sm uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-r border-border max-sm:border-r-0 max-sm:border-b max-sm:flex-[1_1_50%]"
        >
          GitHub
        </a>

        {/* Twitter/X */}
        <a
          href={config.links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] py-4 text-center text-sm uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-r border-border max-sm:border-r-0 max-sm:border-b max-sm:flex-[1_1_50%]"
        >
          Twitter
        </a>

        {/* Copyright */}
        <div className="flex-[2] min-w-[200px] py-4 text-center text-sm uppercase tracking-wide text-muted-foreground max-sm:flex-[1_1_100%]">
          <span>&copy;{currentYear} {config.site.name}</span>
        </div>
      </div>
    </footer>
  )
}
