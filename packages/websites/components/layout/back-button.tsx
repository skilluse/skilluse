import type { ComponentProps } from "react"
import { Icon } from "~/components/shared/icon"
import { PaginationLink } from "~/components/layout/pagination-link"

export const BackButton = ({ ...props }: ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink className="self-start" prefix={<Icon name="ArrowLeft" />} {...props}>
      back
    </PaginationLink>
  )
}
