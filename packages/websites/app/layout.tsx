import type { Metadata } from 'next'
import { config } from '~/config'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: `%s - ${config.site.name}`,
    default: `${config.site.name} - ${config.site.tagline}`,
  },
  description: config.site.description,
  metadataBase: new URL(config.site.url),
  openGraph: {
    siteName: config.site.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@JiweiYuan',
    creator: '@JiweiYuan',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://rsms.me' />
        <link rel='stylesheet' href='https://rsms.me/inter/inter.css' />
      </head>
      <body style={{ fontFamily: 'var(--font-primary)', margin: 0 }}>{children}</body>
    </html>
  )
}
