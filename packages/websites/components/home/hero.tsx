import { Link } from "~/components/shared/link"
import { Button } from "~/components/ui/button"
import { Icon } from "~/components/shared/icon"
import { Stack } from "~/components/shared/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/shared/intro"
import { TerminalHero } from "~/components/home/terminal-hero"
import { config } from "~/config"

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-y-8">
      <Intro alignment="center">
        <IntroTitle className="max-w-[16em] sm:text-4xl md:text-5xl lg:text-6xl">
          {config.site.tagline}
        </IntroTitle>

        <IntroDescription className="lg:mt-2">
          {config.site.description}
        </IntroDescription>
      </Intro>

      <Stack size="lg" className="justify-center">
        <Button asChild size="lg" className="rounded-none w-44">
          <Link href="/docs">
            Get Started
            <Icon name="ArrowRight" />
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="rounded-none w-44">
          <Link href={config.links.github} target="_blank" rel="noopener noreferrer">
            <Icon name="Github" />
            View on GitHub
          </Link>
        </Button>
      </Stack>

      <TerminalHero />
    </section>
  )
}
