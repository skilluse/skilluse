import { icons, type LucideIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { cx } from "~/utils/cva"

type IconProps = ComponentProps<LucideIcon> & {
  name: keyof typeof icons
}

export const Icon = ({ name, className, ...props }: IconProps) => {
  const LucideIcon = icons[name]

  if (!LucideIcon) {
    return null
  }

  return (
    <LucideIcon
      className={cx("size-[1em]", className)}
      {...props}
    />
  )
}
