import { Link } from "~/components/shared/link"
import { Button } from "~/components/ui/button"
import { Icon } from "~/components/shared/icon"
import { Stack } from "~/components/shared/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/shared/intro"

export function CTA() {
  return (
    <Intro alignment="center">
      <IntroTitle size="h2">Ready to supercharge your AI?</IntroTitle>

      <IntroDescription className="max-w-lg">
        Start managing your AI agent skills today. Install once, use everywhere.
      </IntroDescription>

      <Stack size="lg" className="mt-4 justify-center">
        <Button asChild size="lg" className="rounded-none w-44">
          <Link href="/docs">
            Get Started
            <Icon name="ArrowRight" />
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="rounded-none w-44">
          <Link href="/docs">
            <Icon name="BookOpen" />
            Read the Docs
          </Link>
        </Button>
      </Stack>
    </Intro>
  )
}
