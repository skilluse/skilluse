import type { Metadata } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import { config } from "~/config"
import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: {
    template: `%s - ${config.site.name}`,
    default: `${config.site.name} - ${config.site.tagline}`,
  },
  description: config.site.description,
  metadataBase: new URL(config.site.url),
  openGraph: {
    siteName: config.site.name,
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexMono.variable} font-mono antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
