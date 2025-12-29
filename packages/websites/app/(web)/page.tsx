import type { Metadata } from "next"
import { Hero, Features, HowItWorks, SupportedAgents, CTA } from "~/components/home"
import { config } from "~/config"

export const metadata: Metadata = {
  title: `${config.site.name} - ${config.site.tagline}`,
  description: config.site.description,
  openGraph: {
    title: `${config.site.name} - ${config.site.tagline}`,
    description: config.site.description,
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 md:gap-14 lg:gap-16">
      <Hero />
      <Features />
      <HowItWorks />
      <SupportedAgents />
      <CTA />
    </div>
  )
}
