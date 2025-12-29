/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://skilluse.dev",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/api/*", "/opengraph-image", "/*/opengraph-image*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*"],
      },
    ],
  },
}
