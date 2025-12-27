import { Link } from "~/components/common/link"
import { Button } from "~/components/common/button"
import { Icon } from "~/components/common/icon"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { TerminalDemo } from "~/components/web/home/terminal-demo"
import { config } from "~/config"

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-y-8 py-16 md:py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <Intro alignment="center">
        <IntroTitle className="max-w-[16em] sm:text-4xl md:text-5xl lg:text-6xl">
          {config.site.tagline}
        </IntroTitle>

        <IntroDescription className="mt-4 lg:mt-6 max-w-xl">
          {config.site.description}
        </IntroDescription>
      </Intro>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="fancy" size="lg">
          <Link href="/docs">
            Get Started
            <Icon name="ArrowRight" />
          </Link>
        </Button>

        <Button asChild variant="secondary" size="lg">
          <Link href={config.links.github} target="_blank" rel="noopener noreferrer">
            <Icon name="Github" />
            View on GitHub
          </Link>
        </Button>
      </div>

      {/* Terminal Demo */}
      <TerminalDemo className="mt-4" />
    </section>
  )
}
