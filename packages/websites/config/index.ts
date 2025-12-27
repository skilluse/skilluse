import { linksConfig } from "~/config/links"
import { mainNavigation, footerNavigation } from "~/config/navigation"
import { siteConfig } from "~/config/site"

export const config = {
  site: siteConfig,
  links: linksConfig,
  navigation: {
    main: mainNavigation,
    footer: footerNavigation,
  },
}
