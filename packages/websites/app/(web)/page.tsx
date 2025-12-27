import { Hero, Features, HowItWorks, SupportedAgents, CTA } from "~/components/web/home"

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
