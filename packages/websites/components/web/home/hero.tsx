import { Link } from "~/components/common/link"
import { Button } from "~/components/common/button"
import { Icon } from "~/components/common/icon"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { TerminalDemo } from "~/components/web/home/terminal-demo"
import { config } from "~/config"

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-y-6">
      <Intro alignment="center">
        <IntroTitle className="max-w-[16em] sm:text-4xl md:text-5xl lg:text-6xl">
          {config.site.tagline}
        </IntroTitle>

        <IntroDescription className="lg:mt-2">
          {config.site.description}
        </IntroDescription>
      </Intro>

      <Stack size="lg" className="justify-center">
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
      </Stack>

      <TerminalDemo />
    </section>
  )
}
