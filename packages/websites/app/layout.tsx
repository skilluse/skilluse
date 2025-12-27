import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { config } from "~/config"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
