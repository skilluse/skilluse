import { MDXContent } from "@content-collections/mdx/react"
import type { ComponentProps } from "react"
import { Prose } from "~/components/shared/prose"
import { MDXComponents } from "~/components/mdx/mdx-components"
import { cx } from "~/utils/cva"

type MDXProps = ComponentProps<typeof Prose> & ComponentProps<typeof MDXContent>

export const MDX = ({ className, code, components }: MDXProps) => {
  return (
    <Prose className={cx("max-w-none", className)}>
      <MDXContent code={code} components={{ ...MDXComponents, ...components }} />
    </Prose>
  )
}
